import os
import uuid
import requests
import pytest
from pymongo import MongoClient
from bson import ObjectId

BASE_URL = os.getenv('BASE_URL', 'http://localhost:3000')


def load_env_from_file():
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))
    if not os.path.exists(env_path):
        return
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' not in line:
                continue
            key, value = line.split('=', 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


load_env_from_file()
MONGODB_URI = os.getenv('MONGODB_URI') or os.getenv('TEST_MONGODB_URI')


def log_response(label, response):
    try:
        body = response.json()
    except Exception:
        body = response.text
    print(f'\n[{label}] {response.status_code} {response.url}')
    print(body)


def assert_response_shape(resp_json):
    assert isinstance(resp_json, dict)
    assert 'data' in resp_json
    assert 'error' in resp_json


def unique_user_payload(prefix='test'):
    token = uuid.uuid4().hex[:10]
    return {
        'firstName': 'Test',
        'lastName': 'User',
        'username': f'{prefix}_{token}',
        'email': f'{prefix}_{token}@example.com',
        'password': 'secret123',
        'phone': '+38640123456'
    }


def register_user(payload):
    return requests.post(f'{BASE_URL}/api/auth/registerUser', json=payload, timeout=15)


def login_session(payload):
    session = requests.Session()
    r = session.post(
        f'{BASE_URL}/api/auth/loginUser',
        json={'username': payload['username'], 'password': payload['password']},
        timeout=15
    )
    return session, r


def require_login_or_skip(session, login_response):
    if login_response.status_code != 200:
        pytest.skip(f'Login failed with status {login_response.status_code}')
    body = login_response.json()
    if body.get('data', {}).get('requires2FA'):
        pytest.skip('2FA is enabled; login requires verification code')


@pytest.fixture(scope='session')
def mongo_client():
    if not MONGODB_URI:
        pytest.skip('MONGODB_URI is not set; admin tests require DB access')
    return MongoClient(MONGODB_URI)


def make_admin(mongo_client, user_id):
    def try_update(db):
        # Try ObjectId and string fallback
        oid = None
        try:
            oid = ObjectId(user_id)
        except Exception:
            oid = None

        if 'users' not in db.list_collection_names():
            return False

        if oid is not None:
            result = db.users.update_one({'_id': oid}, {'$set': {'admin': True}})
            if result.matched_count >= 1:
                return True

        result = db.users.update_one({'_id': user_id}, {'$set': {'admin': True}})
        if result.matched_count >= 1:
            return True

        return False

    # Prefer the DB from connection string; fallback to searching all DBs if not found
    db = mongo_client.get_default_database()
    if db is not None:
        if try_update(db):
            return True

    # Fallback: try to find the user in any database
    for db_name in mongo_client.list_database_names():
        try:
            candidate = mongo_client[db_name]
            if try_update(candidate):
                return True
        except Exception:
            continue

    return False


def create_and_login(prefix='test'):
    payload = unique_user_payload(prefix=prefix)
    r = register_user(payload)
    if r.status_code != 201:
        raise AssertionError(f'Register failed: {r.status_code} {r.text}')
    session, login_resp = login_session(payload)
    return payload, session, login_resp

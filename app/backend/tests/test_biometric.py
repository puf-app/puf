import requests
from conftest import (
    BASE_URL,
    log_response,
    assert_response_shape,
    unique_user_payload,
    register_user,
    login_session,
    require_login_or_skip,
)


def test_biometric_register_options_requires_auth():
    r = requests.get(f'{BASE_URL}/api/auth/biometric/registerOptions', timeout=10)
    log_response('biometric_register_options_no_auth', r)
    assert r.status_code == 401
    body = r.json()
    assert_response_shape(body)


def test_biometric_list_empty_for_new_user():
    user = unique_user_payload('bio')
    r = register_user(user)
    assert r.status_code == 201

    session, login_resp = login_session(user)
    require_login_or_skip(session, login_resp)

    r = session.get(f'{BASE_URL}/api/auth/biometric/list', timeout=10)
    log_response('biometric_list_empty', r)
    assert r.status_code == 200
    body = r.json()
    assert_response_shape(body)


def test_biometric_login_options_no_device():
    user = unique_user_payload('bioopt')
    r = register_user(user)
    assert r.status_code == 201

    r = requests.get(
        f'{BASE_URL}/api/auth/biometric/loginOptions',
        params={'username': user['username']},
        timeout=10
    )
    log_response('biometric_login_options_no_device', r)
    assert r.status_code == 400
    body = r.json()
    assert_response_shape(body)


def test_biometric_verify_login_missing_session():
    r = requests.post(
        f'{BASE_URL}/api/auth/biometric/verifyLogin',
        json={'username': 'missing', 'body': {}},
        timeout=10
    )
    log_response('biometric_verify_login_missing_session', r)
    assert r.status_code == 400
    body = r.json()
    assert_response_shape(body)

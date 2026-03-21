import os
import tempfile
import requests
from conftest import (
    BASE_URL,
    log_response,
    assert_response_shape,
    unique_user_payload,
    register_user,
    login_session,
    require_login_or_skip,
    make_admin,
    mongo_client,
)


def create_user_and_session(prefix='verif'):
    user = unique_user_payload(prefix)
    r = register_user(user)
    assert r.status_code == 201
    session, login_resp = login_session(user)
    require_login_or_skip(session, login_resp)
    return user, session


def create_verification_request(session):
    r = session.post(
        f'{BASE_URL}/api/verification/request',
        json={'verificationType': 'ID_CARD', 'documentNumber': 'A1234567', 'countryCode': 'SI'},
        timeout=10
    )
    log_response('create_verification_request', r)
    assert r.status_code == 201
    return r.json()['data']['verificationId']


def upload_doc(session, verification_id, side):
    with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
        tmp.write(b'fake image content')
        tmp_path = tmp.name

    with open(tmp_path, 'rb') as f:
        files = {'document': ('test.png', f, 'image/png')}
        data = {'verificationId': verification_id, 'documentSide': side}
        r = session.post(f'{BASE_URL}/api/verification/upload', files=files, data=data, timeout=15)
    os.unlink(tmp_path)
    log_response(f'upload_{side}', r)
    return r


def test_verification_request_update_and_submit_flow():
    user, session = create_user_and_session('verif_flow')

    verification_id = create_verification_request(session)

    r = session.patch(
        f'{BASE_URL}/api/verification/request/{verification_id}',
        json={'documentNumber': 'B7654321'},
        timeout=10
    )
    log_response('update_verification_request', r)
    assert r.status_code == 200

    # submit without docs should fail
    r = session.post(f'{BASE_URL}/api/verification/submit/{verification_id}', timeout=10)
    log_response('submit_verification_missing_docs', r)
    assert r.status_code == 400

    # upload required docs
    assert upload_doc(session, verification_id, 'FRONT').status_code == 201
    assert upload_doc(session, verification_id, 'BACK').status_code == 201
    assert upload_doc(session, verification_id, 'SELFIE').status_code == 201

    r = session.post(f'{BASE_URL}/api/verification/submit/{verification_id}', timeout=10)
    log_response('submit_verification', r)
    assert r.status_code == 200

    r = session.get(f'{BASE_URL}/api/verification/my-status', timeout=10)
    log_response('my_verification_status', r)
    assert r.status_code == 200
    body = r.json()
    assert_response_shape(body)

    # view document (first doc)
    filename = body['data']['documents'][0]['filename']
    r = session.get(f'{BASE_URL}/api/verification/view/{filename}', timeout=10)
    print(f'\n[view_document] {r.status_code} {r.url}')
    assert r.status_code == 200


def test_verification_delete_document_invalid_status():
    user, session = create_user_and_session('verif_del')
    verification_id = create_verification_request(session)

    upload_resp = upload_doc(session, verification_id, 'FRONT')
    assert upload_resp.status_code == 201
    document_id = upload_resp.json()['data']['documentId']

    r = session.delete(f'{BASE_URL}/api/verification/document/{document_id}', timeout=10)
    log_response('delete_document_invalid_status', r)
    assert r.status_code == 400


def test_verification_cancel_request():
    user, session = create_user_and_session('verif_cancel')
    verification_id = create_verification_request(session)

    r = session.delete(f'{BASE_URL}/api/verification/request/{verification_id}', timeout=10)
    log_response('cancel_verification_request', r)
    assert r.status_code == 200


def test_verification_admin_endpoints(mongo_client):
    user, session = create_user_and_session('verif_admin_user')
    verification_id = create_verification_request(session)

    admin_user = unique_user_payload('verif_admin')
    assert register_user(admin_user).status_code == 201
    admin_session, login_resp = login_session(admin_user)
    require_login_or_skip(admin_session, login_resp)

    admin_profile = admin_session.get(f'{BASE_URL}/api/users/getCurrentUserProfile', timeout=10)
    assert admin_profile.status_code == 200
    admin_id = admin_profile.json()['data']['user']['_id']
    assert make_admin(mongo_client, admin_id)

    admin_session, login_resp = login_session(admin_user)
    require_login_or_skip(admin_session, login_resp)

    r = admin_session.get(f'{BASE_URL}/api/verification/requests/list', timeout=10)
    log_response('admin_list_verifications', r)
    assert r.status_code == 200

    r = admin_session.get(f'{BASE_URL}/api/verification/details/{verification_id}', timeout=10)
    log_response('admin_get_verification_details', r)
    assert r.status_code == 200

    r = admin_session.patch(
        f'{BASE_URL}/api/verification/review/{verification_id}',
        json={'status': 'REJECTED', 'reviewNote': 'Needs clearer photo'},
        timeout=10
    )
    log_response('admin_review_verification', r)
    assert r.status_code == 200

    r = admin_session.get(f'{BASE_URL}/api/verification/stats', timeout=10)
    log_response('admin_verification_stats', r)
    assert r.status_code == 200

    # user resubmit after rejection
    r = session.post(f'{BASE_URL}/api/verification/resubmit/{verification_id}', timeout=10)
    log_response('user_resubmit_verification', r)
    assert r.status_code == 200

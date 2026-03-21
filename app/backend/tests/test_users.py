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


def test_get_current_user_profile():
    user = unique_user_payload('userprofile')
    r = register_user(user)
    assert r.status_code == 201

    session, login_resp = login_session(user)
    require_login_or_skip(session, login_resp)

    r = session.get(f'{BASE_URL}/api/users/getCurrentUserProfile', timeout=10)
    log_response('get_current_user_profile', r)
    assert r.status_code == 200
    body = r.json()
    assert_response_shape(body)


def test_update_user_profile_self():
    user = unique_user_payload('userupdate')
    r = register_user(user)
    assert r.status_code == 201

    session, login_resp = login_session(user)
    require_login_or_skip(session, login_resp)

    profile = session.get(f'{BASE_URL}/api/users/getCurrentUserProfile', timeout=10)
    assert profile.status_code == 200
    user_id = profile.json()['data']['user']['_id']

    r = session.patch(
        f'{BASE_URL}/api/users/updateUserProfile/{user_id}',
        json={'phone': '+38649999999'},
        timeout=10
    )
    log_response('update_user_profile_self', r)
    assert r.status_code == 200


def test_search_users_requires_query():
    user = unique_user_payload('usersrch')
    r = register_user(user)
    assert r.status_code == 201

    session, login_resp = login_session(user)
    require_login_or_skip(session, login_resp)

    r = session.get(f'{BASE_URL}/api/users/searchUsers', timeout=10)
    log_response('search_users_missing_query', r)
    assert r.status_code == 400
    body = r.json()
    assert_response_shape(body)


def test_get_user_by_id_and_delete_self():
    user = unique_user_payload('userdel')
    r = register_user(user)
    assert r.status_code == 201

    session, login_resp = login_session(user)
    require_login_or_skip(session, login_resp)

    # get current profile to obtain user id
    profile = session.get(f'{BASE_URL}/api/users/getCurrentUserProfile', timeout=10)
    assert profile.status_code == 200
    user_id = profile.json()['data']['user']['_id']

    r = session.get(f'{BASE_URL}/api/users/getUserById/{user_id}', timeout=10)
    log_response('get_user_by_id', r)
    assert r.status_code == 200
    body = r.json()
    assert_response_shape(body)

    r = session.delete(f'{BASE_URL}/api/users/deleteUser/{user_id}', timeout=10)
    log_response('delete_user_self', r)
    assert r.status_code == 200
    body = r.json()
    assert_response_shape(body)


def test_admin_get_all_users(mongo_client):
    user = unique_user_payload('admin')
    r = register_user(user)
    assert r.status_code == 201

    session, login_resp = login_session(user)
    require_login_or_skip(session, login_resp)

    # fetch profile for id
    profile = session.get(f'{BASE_URL}/api/users/getCurrentUserProfile', timeout=10)
    assert profile.status_code == 200
    user_id = profile.json()['data']['user']['_id']

    assert make_admin(mongo_client, user_id)

    # re-login to refresh session role
    session, login_resp = login_session(user)
    require_login_or_skip(session, login_resp)

    r = session.get(f'{BASE_URL}/api/users/getAllUsers', timeout=10)
    log_response('admin_get_all_users', r)
    assert r.status_code == 200
    body = r.json()
    assert_response_shape(body)

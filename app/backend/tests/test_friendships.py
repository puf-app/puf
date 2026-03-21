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


def create_user_and_session(prefix):
    user = unique_user_payload(prefix)
    r = register_user(user)
    assert r.status_code == 201
    session, login_resp = login_session(user)
    require_login_or_skip(session, login_resp)
    return user, session


def test_friend_request_accept_flow():
    user_a, session_a = create_user_and_session('friend_a')
    user_b, session_b = create_user_and_session('friend_b')

    # A sends request to B
    r = session_a.post(
        f'{BASE_URL}/api/friendships/friendRequest',
        json={'receiverUserId': get_user_id(session_b)},
        timeout=10
    )
    log_response('friend_request_create', r)
    assert r.status_code == 201
    body = r.json()
    assert_response_shape(body)
    request_id = body['data']['friendRequest']['_id']

    # B accepts
    r = session_b.patch(
        f'{BASE_URL}/api/friendships/friendRequestAccept/{request_id}',
        timeout=10
    )
    log_response('friend_request_accept', r)
    assert r.status_code == 200
    body = r.json()
    assert_response_shape(body)

    # A gets friendships
    r = session_a.get(f'{BASE_URL}/api/friendships/getFriendships', timeout=10)
    log_response('get_friendships', r)
    assert r.status_code == 200
    body = r.json()
    assert_response_shape(body)

    # Block/unblock by user id
    b_id = get_user_id(session_b)
    r = session_a.patch(f'{BASE_URL}/api/friendships/blockFriendshipByUserId/{b_id}', timeout=10)
    log_response('block_friendship_by_user', r)
    assert r.status_code == 200
    r = session_a.patch(f'{BASE_URL}/api/friendships/unblockFriendshipByUserId/{b_id}', timeout=10)
    log_response('unblock_friendship_by_user', r)
    assert r.status_code == 200

    # Remove friendship
    r = session_a.delete(f'{BASE_URL}/api/friendships/removeFriendshipByUserId/{b_id}', timeout=10)
    log_response('remove_friendship_by_user', r)
    assert r.status_code == 200


def test_friend_request_cancel_and_reject():
    user_a, session_a = create_user_and_session('friend_c')
    user_b, session_b = create_user_and_session('friend_d')

    # Create request
    r = session_a.post(
        f'{BASE_URL}/api/friendships/friendRequest',
        json={'receiverUserId': get_user_id(session_b)},
        timeout=10
    )
    assert r.status_code == 201
    request_id = r.json()['data']['friendRequest']['_id']

    # Cancel by sender
    r = session_a.patch(f'{BASE_URL}/api/friendships/friendRequestCancel/{request_id}', timeout=10)
    log_response('friend_request_cancel', r)
    assert r.status_code == 200

    # Create another request to reject
    r = session_a.post(
        f'{BASE_URL}/api/friendships/friendRequest',
        json={'receiverUserId': get_user_id(session_b)},
        timeout=10
    )
    assert r.status_code == 201
    request_id = r.json()['data']['friendRequest']['_id']

    r = session_b.patch(f'{BASE_URL}/api/friendships/friendRequestReject/{request_id}', timeout=10)
    log_response('friend_request_reject', r)
    assert r.status_code == 200


def test_admin_friendship_endpoints(mongo_client):
    admin_user, admin_session = create_user_and_session('admin_friend')

    # promote admin
    admin_id = get_user_id(admin_session)
    assert make_admin(mongo_client, admin_id)
    admin_session, login_resp = login_session(admin_user)
    require_login_or_skip(admin_session, login_resp)

    other_user, other_session = create_user_and_session('friend_e')
    other_id = get_user_id(other_session)

    # admin creates friendship with other
    r = admin_session.post(
        f'{BASE_URL}/api/friendships/createFriendship',
        json={'secondUserId': other_id},
        timeout=10
    )
    log_response('admin_create_friendship', r)
    assert r.status_code == 201
    friendship_id = r.json()['data']['friendship']['_id']

    # admin get all friend requests
    r = admin_session.get(f'{BASE_URL}/api/friendships/getFriendRequests', timeout=10)
    log_response('admin_get_friend_requests', r)
    assert r.status_code == 200

    # admin get all friendships
    r = admin_session.get(f'{BASE_URL}/api/friendships/getAllFriendships', timeout=10)
    log_response('admin_get_all_friendships', r)
    assert r.status_code == 200

    # admin block/unblock by id
    r = admin_session.patch(f'{BASE_URL}/api/friendships/blockFriendshipById/{friendship_id}', timeout=10)
    log_response('admin_block_friendship', r)
    assert r.status_code == 200

    r = admin_session.patch(f'{BASE_URL}/api/friendships/unblockFriendshipById/{friendship_id}', timeout=10)
    log_response('admin_unblock_friendship', r)
    assert r.status_code == 200

    # admin remove by id
    r = admin_session.delete(f'{BASE_URL}/api/friendships/removeFriendshipById/{friendship_id}', timeout=10)
    log_response('admin_remove_friendship', r)
    assert r.status_code == 200

    # admin delete friend requests by user id and status
    r = admin_session.delete(
        f'{BASE_URL}/api/friendships/deleteFriendRequestsByUserIdAndStatus/{other_id}/PENDING',
        timeout=10
    )
    log_response('admin_delete_friend_requests_by_user_and_status', r)
    assert r.status_code == 200


def get_user_id(session):
    r = session.get(f'{BASE_URL}/api/users/getCurrentUserProfile', timeout=10)
    assert r.status_code == 200
    return r.json()['data']['user']['_id']

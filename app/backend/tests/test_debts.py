import pytest
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


def ensure_debt_routes_available():
    r = requests.post(f'{BASE_URL}/api/debts/createDebt', json={}, timeout=10)
    if r.status_code == 404:
        pytest.skip('Debt routes are not mounted in app.js')


def create_two_users_and_login():
    creditor = unique_user_payload('debt_cr')
    debtor = unique_user_payload('debt_db')
    r = register_user(creditor)
    assert r.status_code == 201
    r = register_user(debtor)
    assert r.status_code == 201
    session, login_resp = login_session(creditor)
    require_login_or_skip(session, login_resp)
    return creditor, debtor, session


def test_debt_crud_flow():
    ensure_debt_routes_available()

    creditor, debtor, session = create_two_users_and_login()

    r = session.post(
        f'{BASE_URL}/api/debts/createDebt',
        json={
            'debtor_username': debtor['username'],
            'title': 'Lunch',
            'amount': '12.50',
            'currency': 'EUR',
            'reason': 'Pizza'
        },
        timeout=10
    )
    log_response('create_debt', r)
    assert r.status_code == 201
    body = r.json()
    assert_response_shape(body)
    debt_id = body['data']['debt']['_id']

    r = session.patch(
        f'{BASE_URL}/api/debts/updateDebt/{debt_id}',
        json={'title': 'Lunch updated'},
        timeout=10
    )
    log_response('update_debt', r)
    assert r.status_code == 200

    r = session.patch(f'{BASE_URL}/api/debts/completeDebt/{debt_id}', timeout=10)
    log_response('complete_debt', r)
    assert r.status_code == 200

    r = session.delete(f'{BASE_URL}/api/debts/deleteDebt/{debt_id}', timeout=10)
    log_response('delete_debt', r)
    assert r.status_code == 200

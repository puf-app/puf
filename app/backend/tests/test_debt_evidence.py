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


def create_debt(session, debtor_username):
    r = session.post(
        f'{BASE_URL}/api/debts/createDebt',
        json={
            'debtor_username': debtor_username,
            'title': 'Test debt',
            'amount': '10',
            'currency': 'EUR'
        },
        timeout=10
    )
    assert r.status_code == 201
    return r.json()['data']['debt']['_id']


def test_debt_evidence_flow():
    ensure_debt_routes_available()

    creditor = unique_user_payload('evidence_cr')
    debtor = unique_user_payload('evidence_db')
    assert register_user(creditor).status_code == 201
    assert register_user(debtor).status_code == 201

    session, login_resp = login_session(creditor)
    require_login_or_skip(session, login_resp)

    debt_id = create_debt(session, debtor['username'])

    r = session.post(
        f'{BASE_URL}/api/debtEvidence/createDebtEvidence',
        json={
            'debt_id': debt_id,
            'file_name': 'receipt.png',
            'file_type': 'image/png',
            'file_url': 'http://example.com/receipt.png',
            'evidence_type': 'RECEIPT',
            'description': 'Lunch receipt'
        },
        timeout=10
    )
    log_response('create_debt_evidence', r)
    assert r.status_code == 201
    body = r.json()
    assert_response_shape(body)
    evidence_id = body['data']['evidence']['_id']

    r = session.patch(
        f'{BASE_URL}/api/debtEvidence/updateDebtEvidence/{evidence_id}',
        json={'description': 'Updated description'},
        timeout=10
    )
    log_response('update_debt_evidence', r)
    assert r.status_code == 200

    r = session.delete(
        f'{BASE_URL}/api/debtEvidence/deleteDebtEvidence/{evidence_id}',
        timeout=10
    )
    log_response('delete_debt_evidence', r)
    assert r.status_code == 200

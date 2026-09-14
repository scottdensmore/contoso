import time

import pytest
from contoso_chat.session_store import (
    ChatMessage,
    ChatSession,
    append_message,
    clear_session_store,
    create_or_get_session,
    delete_session,
    get_history_for_llm,
    get_session,
    list_sessions,
)


@pytest.fixture(autouse=True)
def cleanup_store():
    clear_session_store()
    yield
    clear_session_store()


def test_chat_message_model():
    msg = ChatMessage(
        role="user",
        content="Hello world",
        timestamp="2026-09-13T12:00:00Z",
        citations=[{"name": "Tent", "slug": "tent"}],
        order_tracking={"order_id": "123", "status": "Shipped"},
    )
    assert msg.role == "user"
    assert msg.content == "Hello world"
    assert msg.timestamp == "2026-09-13T12:00:00Z"
    assert msg.citations == [{"name": "Tent", "slug": "tent"}]
    assert msg.order_tracking == {"order_id": "123", "status": "Shipped"}


def test_chat_session_model():
    session = ChatSession(
        session_id="sess-100",
        customer_id="cust-200",
        title="Tent Query",
        created_at="2026-09-13T12:00:00Z",
        updated_at="2026-09-13T12:00:00Z",
        messages=[],
    )
    assert session.session_id == "sess-100"
    assert session.customer_id == "cust-200"
    assert session.title == "Tent Query"
    assert session.messages == []


def test_create_or_get_session_creates_new():
    session = create_or_get_session(
        session_id="sess-1",
        customer_id="cust-1",
        title="Summer Camping",
    )
    assert session.session_id == "sess-1"
    assert session.customer_id == "cust-1"
    assert session.title == "Summer Camping"
    assert session.messages == []
    assert session.created_at
    assert session.updated_at
    assert session.created_at == session.updated_at


def test_create_or_get_session_default_title():
    session = create_or_get_session(session_id="sess-default")
    assert session.title == "New Chat"
    assert session.customer_id is None


def test_create_or_get_session_gets_existing():
    session1 = create_or_get_session(session_id="sess-dup", customer_id="cust-dup", title="First Title")
    created_at = session1.created_at
    time.sleep(0.01)

    session2 = create_or_get_session(session_id="sess-dup", customer_id="cust-dup", title="Second Title")
    assert session2.session_id == session1.session_id
    assert session2.title == "First Title"  # Existing title preserved
    assert session2.created_at == created_at


def test_append_message_updates_session_and_timestamp():
    session = create_or_get_session(session_id="sess-msg")
    initial_updated_at = session.updated_at
    time.sleep(0.01)

    updated_session = append_message(
        session_id="sess-msg",
        role="user",
        content="What is the best 2-person tent?",
    )
    assert len(updated_session.messages) == 1
    assert updated_session.messages[0].role == "user"
    assert updated_session.messages[0].content == "What is the best 2-person tent?"
    assert updated_session.updated_at >= initial_updated_at

    # Append assistant reply with citations and order tracking
    citations = [{"name": "TrailMaster", "slug": "trailmaster"}]
    order_tracking = {"order_id": "ord-1", "status": "Delivered"}
    updated_session_2 = append_message(
        session_id="sess-msg",
        role="assistant",
        content="The TrailMaster 2 is our top choice.",
        citations=citations,
        order_tracking=order_tracking,
    )
    assert len(updated_session_2.messages) == 2
    assert updated_session_2.messages[1].role == "assistant"
    assert updated_session_2.messages[1].citations == citations
    assert updated_session_2.messages[1].order_tracking == order_tracking


def test_title_auto_generation_from_first_user_question():
    session = create_or_get_session(session_id="sess-auto-title")
    assert session.title == "New Chat"

    # First user message updates title with first ~40 characters
    long_question = "Can you recommend a waterproof 4-person tent that handles heavy snow?"
    append_message(
        session_id="sess-auto-title",
        role="user",
        content=long_question,
    )
    stored = get_session("sess-auto-title")
    assert stored is not None
    assert stored.title == long_question[:40]
    assert len(stored.title) <= 40

    # Subsequent user message does NOT overwrite the title
    append_message(
        session_id="sess-auto-title",
        role="user",
        content="Also looking for sleeping bags.",
    )
    stored_2 = get_session("sess-auto-title")
    assert stored_2 is not None
    assert stored_2.title == long_question[:40]


def test_title_not_overwritten_if_custom_title_provided():
    create_or_get_session(
        session_id="sess-custom-title",
        title="Custom Expedition Gear",
    )
    append_message(
        session_id="sess-custom-title",
        role="user",
        content="What sleeping bags do you have for zero degrees?",
    )
    stored = get_session("sess-custom-title")
    assert stored is not None
    assert stored.title == "Custom Expedition Gear"


def test_get_session():
    assert get_session("non-existent") is None
    created = create_or_get_session(session_id="sess-lookup", customer_id="cust-123")
    found = get_session("sess-lookup")
    assert found is not None
    assert found.session_id == created.session_id


def test_list_sessions_sorting_and_filtering():
    create_or_get_session(session_id="sess-list-1", customer_id="cust-alpha")
    time.sleep(0.01)
    create_or_get_session(session_id="sess-list-2", customer_id="cust-beta")
    time.sleep(0.01)
    create_or_get_session(session_id="sess-list-3", customer_id="cust-alpha")
    time.sleep(0.01)

    # Touch s1 so its updated_at is most recent
    append_message("sess-list-1", role="user", content="Ping s1")

    # List all sessions (no filter)
    all_sessions = list_sessions()
    assert len(all_sessions) == 3
    # Sorted by updated_at descending -> sess-list-1 should be first
    assert all_sessions[0].session_id == "sess-list-1"

    # Filter by customer_id
    alpha_sessions = list_sessions(customer_id="cust-alpha")
    assert len(alpha_sessions) == 2
    assert {s.session_id for s in alpha_sessions} == {"sess-list-1", "sess-list-3"}
    assert alpha_sessions[0].session_id == "sess-list-1"

    beta_sessions = list_sessions(customer_id="cust-beta")
    assert len(beta_sessions) == 1
    assert beta_sessions[0].session_id == "sess-list-2"

    empty_sessions = list_sessions(customer_id="non-existent-cust")
    assert empty_sessions == []


def test_delete_session():
    create_or_get_session(session_id="sess-del")
    assert get_session("sess-del") is not None

    deleted = delete_session("sess-del")
    assert deleted is True
    assert get_session("sess-del") is None

    # Deleting again returns False
    deleted_again = delete_session("sess-del")
    assert deleted_again is False


def test_get_history_for_llm():
    # Non-existent session
    assert get_history_for_llm("non-existent") == []

    create_or_get_session(session_id="sess-hist")
    append_message("sess-hist", role="user", content="Question 1")
    append_message("sess-hist", role="assistant", content="Answer 1")
    append_message("sess-hist", role="user", content="Question 2")
    append_message("sess-hist", role="assistant", content="Answer 2")

    history = get_history_for_llm("sess-hist")
    assert history == [
        {"role": "user", "content": "Question 1"},
        {"role": "assistant", "content": "Answer 1"},
        {"role": "user", "content": "Question 2"},
        {"role": "assistant", "content": "Answer 2"},
    ]

    # Max turns bounding
    bounded = get_history_for_llm("sess-hist", max_turns=2)
    assert bounded == [
        {"role": "user", "content": "Question 2"},
        {"role": "assistant", "content": "Answer 2"},
    ]

    # Non-positive max turns returns empty
    assert get_history_for_llm("sess-hist", max_turns=0) == []
    assert get_history_for_llm("sess-hist", max_turns=-1) == []


def test_clear_session_store():
    create_or_get_session("s1")
    create_or_get_session("s2")
    assert len(list_sessions()) == 2

    clear_session_store()
    assert len(list_sessions()) == 0

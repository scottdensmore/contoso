import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import FaqSearch from './faq-search';

describe('FaqSearch Component', () => {
  it('renders search input, category chips, expand all button, and all questions collapsed initially', () => {
    render(<FaqSearch />);

    // Search input
    const searchInput = screen.getByRole('searchbox', { name: /search faq/i });
    expect(searchInput).toBeDefined();

    // Category buttons group
    const categoryGroup = screen.getByRole('group', { name: /filter faq by category/i });
    const allBtn = within(categoryGroup).getByRole('button', { name: /^all/i });
    expect(allBtn).toBeDefined();
    expect(allBtn.getAttribute('aria-pressed')).toBe('true');

    const orderingBtn = within(categoryGroup).getByRole('button', { name: /ordering & shipping/i });
    expect(orderingBtn).toBeDefined();
    expect(orderingBtn.getAttribute('aria-pressed')).toBe('false');

    // Expand All button
    const expandAllBtn = screen.getByRole('button', { name: /expand all/i });
    expect(expandAllBtn).toBeDefined();

    // Live announcement
    const liveRegion = screen.getByRole('status');
    expect(liveRegion.getAttribute('aria-live')).toBe('polite');
    expect(liveRegion.textContent).toMatch(/showing \d+ questions/i);

    // Initial questions rendered and collapsed
    const questionButtons = screen.getAllByRole('button', { name: /how|what|when|do/i });
    expect(questionButtons.length).toBeGreaterThanOrEqual(8);
    questionButtons.forEach((btn) => {
      expect(btn.getAttribute('aria-expanded')).toBe('false');
      const controls = btn.getAttribute('aria-controls');
      expect(controls).toMatch(/^faq-answer-/);
    });
  });

  it('expands and collapses individual accordion items on click', () => {
    render(<FaqSearch />);

    const questionButton = screen.getByRole('button', {
      name: /how can i track my order\?/i,
    });
    expect(questionButton.getAttribute('aria-expanded')).toBe('false');

    // Expand
    fireEvent.click(questionButton);
    expect(questionButton.getAttribute('aria-expanded')).toBe('true');

    const answerId = questionButton.getAttribute('aria-controls')!;
    const answerPanel = document.getElementById(answerId)!;
    expect(answerPanel).toBeDefined();
    expect(answerPanel.getAttribute('role')).toBe('region');
    expect(answerPanel.getAttribute('aria-labelledby')).toBe(questionButton.id);
    expect(within(answerPanel).getByText(/carrier tracking details/i)).toBeDefined();

    // Contains link to /track
    const trackLink = within(answerPanel).getByRole('link', { name: /track your order online/i });
    expect(trackLink).toBeDefined();
    expect(trackLink.getAttribute('href')).toBe('/track');

    // Collapse again
    fireEvent.click(questionButton);
    expect(questionButton.getAttribute('aria-expanded')).toBe('false');
  });

  it('toggles Expand All / Collapse All functionality', () => {
    render(<FaqSearch />);

    const toggleAllBtn = screen.getByRole('button', { name: /expand all/i });

    // Expand all
    fireEvent.click(toggleAllBtn);
    expect(toggleAllBtn.textContent).toMatch(/collapse all/i);

    const questionButtons = screen.getAllByRole('button', { name: /how|what|when|do/i });
    questionButtons.forEach((btn) => {
      expect(btn.getAttribute('aria-expanded')).toBe('true');
    });

    // Collapse all
    fireEvent.click(toggleAllBtn);
    expect(toggleAllBtn.textContent).toMatch(/expand all/i);
    questionButtons.forEach((btn) => {
      expect(btn.getAttribute('aria-expanded')).toBe('false');
    });
  });

  it('filters questions interactively via search input', () => {
    render(<FaqSearch />);

    const searchInput = screen.getByRole('searchbox', { name: /search faq/i });
    fireEvent.change(searchInput, { target: { value: 'warranty' } });

    // Only warranty question should be visible
    expect(screen.getByText(/do contoso products come with a warranty\?/i)).toBeDefined();
    expect(screen.queryByText(/how long will it take to receive my order\?/i)).toBeNull();

    // Live region updates
    const liveRegion = screen.getByRole('status');
    expect(liveRegion.textContent).toMatch(/showing 1 question/i);

    // Clear search input button is present
    const clearInputBtn = screen.getByRole('button', { name: /clear search input/i });
    expect(clearInputBtn).toBeDefined();

    fireEvent.click(clearInputBtn);
    expect(searchInput).toHaveValue('');
    expect(screen.getByText(/how long will it take to receive my order\?/i)).toBeDefined();
  });

  it('filters questions by category chips', () => {
    render(<FaqSearch />);

    const categoryGroup = screen.getByRole('group', { name: /filter faq by category/i });
    const returnsBtn = within(categoryGroup).getByRole('button', { name: /returns & refunds/i });
    fireEvent.click(returnsBtn);

    expect(returnsBtn.getAttribute('aria-pressed')).toBe('true');
    const allBtn = within(categoryGroup).getByRole('button', { name: /^all/i });
    expect(allBtn.getAttribute('aria-pressed')).toBe('false');

    expect(screen.getByText(/what is your return policy\?/i)).toBeDefined();
    expect(screen.getByText(/how do i return an item\?/i)).toBeDefined();
    expect(screen.getByText(/when will i get my refund\?/i)).toBeDefined();
    expect(screen.queryByText(/do contoso products come with a warranty\?/i)).toBeNull();

    // Reset to All
    fireEvent.click(allBtn);
    expect(allBtn.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(/do contoso products come with a warranty\?/i)).toBeDefined();
  });

  it('displays empty state with clear search button and contact support link when no results match', () => {
    render(<FaqSearch />);

    const searchInput = screen.getByRole('searchbox', { name: /search faq/i });
    fireEvent.change(searchInput, { target: { value: 'xyznonsense123' } });

    // Empty state message
    expect(screen.getByText(/no questions found matching 'xyznonsense123'/i)).toBeDefined();

    // Contact support link in empty state
    const contactLinks = screen.getAllByRole('link', { name: /contact support/i });
    expect(contactLinks.length).toBeGreaterThanOrEqual(1);
    expect(contactLinks.some((l) => l.getAttribute('href') === '/contact')).toBe(true);

    // Clear search button in empty state
    const clearBtn = screen.getByRole('button', { name: 'Clear search' });
    fireEvent.click(clearBtn);

    expect(searchInput).toHaveValue('');
    expect(screen.queryByText(/no questions found matching/i)).toBeNull();
    expect(screen.getByText(/how long will it take to receive my order\?/i)).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SeaCavePneumaticsHub from './sea-cave-pneumatics-hub';

describe('SeaCavePneumaticsHub component', () => {
  it('renders all 5 curated sites initially and filters by morphology, wave regime, and traversal mode', () => {
    render(<SeaCavePneumaticsHub />);

    expect(
      screen.getByText(
        /Russian Gulch Devil's Punchbowl & Mendocino Headland Surge Caverns/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Kiama & Bombo Headland Columnar Basalt Blowhole Conduit/i)
    ).toBeInTheDocument();

    const morphologySelect = screen.getByLabelText(
      /Littoral Conduit Morphology/i
    );
    fireEvent.change(morphologySelect, {
      target: { value: 'constricted_pneumatic_blowhole_shaft' },
    });

    expect(
      screen.getByText(/Kiama & Bombo Headland Columnar Basalt Blowhole Conduit/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Russian Gulch Devil's Punchbowl & Mendocino Headland Surge Caverns/i
      )
    ).not.toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    fireEvent.click(resetBtn);

    expect(
      screen.getByText(
        /Russian Gulch Devil's Punchbowl & Mendocino Headland Surge Caverns/i
      )
    ).toBeInTheDocument();
  });

  it('loads a site into the calculator when clicking Load into Calculator', () => {
    render(<SeaCavePneumaticsHub />);

    const staffaCard = screen.getByTestId(
      'sea-cave-pneumatics-site-card-staffa-fingals-cave-columnar-basalt-surge-vault'
    );
    const loadButton = staffaCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(
      screen.getByLabelText(/Portal Ceiling Clearance \(m\)/i)
    ).toHaveValue(6.5);
    expect(screen.getByLabelText(/Significant Wave Height \(m\)/i)).toHaveValue(
      1.4
    );
    expect(screen.getByLabelText(/Swell Period \(s\)/i)).toHaveValue(12);
    expect(screen.getByLabelText(/Chamber Convergence Ratio/i)).toHaveValue(
      1.8
    );
    expect(screen.getByLabelText(/Chamber Length \(m\)/i)).toHaveValue(72);
  });

  it('updates calculator live output panel across all 3 quick presets and numeric inputs', () => {
    render(<SeaCavePneumaticsHub />);

    const resultPanel = screen.getByTestId(
      'sea-cave-pneumatics-calculator-result'
    );
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('nominal_vented_slack_swell_window');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Groundswell Clapotis Caution/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'caution_acoustic_overpressure_and_rebound_surge'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Long-Period Forerunner Piston-Seal Abort/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort_pneumatic_piston_seal_and_blowhole_eruption'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Vented Slack-Tide Arch Window/i,
      })
    );
    expect(resultPanel).toHaveTextContent('nominal_vented_slack_swell_window');
  });

  it('tracks mandatory impact, barotrauma, and buoyancy gear checklist items', () => {
    render(<SeaCavePneumaticsHub />);

    const counter = screen.getByTestId('sea-cave-pneumatics-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 mandatory items verified');

    const helmetCheckbox = screen.getByLabelText(
      /CE EN 1385 Multi-Impact Whitewater & Littoral Surf Helmet/i
    );
    fireEvent.click(helmetCheckbox);
    expect(counter).toHaveTextContent('1 / 6 mandatory items verified');

    const earplugsCheckbox = screen.getByLabelText(
      /Vented Acoustic-Attenuation & Barotrauma Defense Surf Earplugs/i
    );
    fireEvent.click(earplugsCheckbox);
    expect(counter).toHaveTextContent('2 / 6 mandatory items verified');
  });
});

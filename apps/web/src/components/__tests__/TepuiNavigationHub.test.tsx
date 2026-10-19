import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TepuiNavigationHub from '../TepuiNavigationHub';

describe('TepuiNavigationHub component', () => {
  it('renders all 4 quartzite tepui plateau sites initially and filters by country, morphology, difficulty, and search query', () => {
    render(<TepuiNavigationHub />);

    expect(
      screen.getByText(
        /Mount Roraima Maverick Summit & Labyrinth Pseudokarst Plateau/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Auyán-Tepui Devil's Canyon & Churún Orthoquartzite Mesa/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Kukenán \(Matawi\) Tepui Proterozoic Escarpment & Summit Chasm/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Serranía de Chiribiquete Quartzite Table-Mountain Mesas/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Colombia' } });

    expect(
      screen.getByText(
        /Serranía de Chiribiquete Quartzite Table-Mountain Mesas/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Mount Roraima Maverick Summit & Labyrinth Pseudokarst Plateau/i
      )
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(
        /Mount Roraima Maverick Summit & Labyrinth Pseudokarst Plateau/i
      )
    ).toBeInTheDocument();

    // Filter by morphology
    const morphologySelect = screen.getByLabelText(/Tepui Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'brocchinia-bog-sinkhole-mesa' },
    });
    expect(
      screen.getByText(
        /Auyán-Tepui Devil's Canyon & Churún Orthoquartzite Mesa/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Serranía de Chiribiquete Quartzite Table-Mountain Mesas/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Tepui Sites/i);
    fireEvent.change(searchInput, { target: { value: 'Maverick' } });
    expect(
      screen.getByText(
        /Mount Roraima Maverick Summit & Labyrinth Pseudokarst Plateau/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Serranía de Chiribiquete Quartzite Table-Mountain Mesas/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<TepuiNavigationHub />);

    const roraimaCard = screen.getByTestId(
      'tepui-site-card-mount-roraima-maverick-plateau'
    );
    const loadButton = roraimaCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(
      screen.getByLabelText(/Cyanobacteria Biofilm Coverage \(%\)/i)
    ).toHaveValue(82);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<TepuiNavigationHub />);

    const resultPanel = screen.getByTestId('tepui-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('sticky-rubber-cairn-bearing');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Peat-Bog & Biofilm Slab/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'felt-overboot-probe-peat-bridges'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Pseudokarst Fissure & Cloud Fog/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'belayed-fissure-jump-gps-breadcrumb'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Orographic Deluge & Black-Algae Slip/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort-shelter-under-el-hotel-overhang'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<TepuiNavigationHub />);

    const counter = screen.getByTestId('tepui-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const overbootsCheckbox = screen.getByLabelText(
      /Polypropylene Felt-Soled Biofilm Overboots & Sticky-Rubber Approach Shoes/i
    );
    fireEvent.click(overbootsCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const probeCheckbox = screen.getByLabelText(
      /Graduated Carbon Fissure-Bridge Probe Pole & 30m Static Belay Line/i
    );
    fireEvent.click(probeCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});

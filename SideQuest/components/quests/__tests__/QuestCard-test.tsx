import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuestCard } from '../QuestCard';
import { Quest } from '@/types/quest';

// Mock the quest data
const mockQuest: Quest = {
  id: '1',
  text: 'Take a 10-minute walk outside and notice 3 things you haven\'t seen before',
  category: 'outdoors',
  estimatedTime: '10 min',
  difficulty: 'easy',
  tags: ['nature', 'mindfulness', 'exercise'],
  selected: false,
  completed: false,
  skipped: false,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
};

const mockHandlers = {
  onSelect: jest.fn(),
  onComplete: jest.fn(),
  onSkip: jest.fn(),
  onFeedback: jest.fn(),
};

describe('QuestCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders quest information correctly', () => {
    const { getByText } = render(
      <QuestCard
        quest={mockQuest}
        {...mockHandlers}
      />
    );

    expect(getByText('Take a 10-minute walk outside and notice 3 things you haven\'t seen before')).toBeTruthy();
    expect(getByText('Outdoors')).toBeTruthy();
    expect(getByText('Easy')).toBeTruthy();
    expect(getByText('10 min')).toBeTruthy();
    expect(getByText('#nature')).toBeTruthy();
    expect(getByText('#mindfulness')).toBeTruthy();
    expect(getByText('#exercise')).toBeTruthy();
  });

  it('shows select button when quest is not selected', () => {
    const { getByText } = render(
      <QuestCard
        quest={mockQuest}
        {...mockHandlers}
      />
    );

    expect(getByText('Select')).toBeTruthy();
  });

  it('shows selected state when quest is selected', () => {
    const selectedQuest = { ...mockQuest, selected: true };
    const { getByText } = render(
      <QuestCard
        quest={selectedQuest}
        {...mockHandlers}
      />
    );

    expect(getByText('Selected')).toBeTruthy();
    expect(getByText('Complete')).toBeTruthy();
    expect(getByText('Skip')).toBeTruthy();
  });

  it('calls onSelect when select button is pressed', () => {
    const { getByText } = render(
      <QuestCard
        quest={mockQuest}
        {...mockHandlers}
      />
    );

    fireEvent.press(getByText('Select'));
    expect(mockHandlers.onSelect).toHaveBeenCalledWith('1');
  });

  it('shows completed state when quest is completed', () => {
    const completedQuest = { 
      ...mockQuest, 
      selected: true, 
      completed: true,
      feedback: {
        rating: 'thumbs_up',
        completed: true,
      }
    };
    
    const { getByText } = render(
      <QuestCard
        quest={completedQuest}
        {...mockHandlers}
        showActions={false}
      />
    );

    expect(getByText('Completed!')).toBeTruthy();
    expect(getByText('Liked this quest!')).toBeTruthy();
  });

  it('shows skipped state when quest is skipped', () => {
    const skippedQuest = { 
      ...mockQuest, 
      selected: true, 
      skipped: true,
      feedback: {
        rating: null,
        completed: false,
      }
    };
    
    const { getByText } = render(
      <QuestCard
        quest={skippedQuest}
        {...mockHandlers}
        showActions={false}
      />
    );

    expect(getByText('Skipped')).toBeTruthy();
  });

  it('shows expired state when quest is expired', () => {
    const expiredQuest = { 
      ...mockQuest, 
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
    };
    
    const { getByText } = render(
      <QuestCard
        quest={expiredQuest}
        {...mockHandlers}
        showActions={false}
      />
    );

    expect(getByText('Expired')).toBeTruthy();
  });

  it('does not show actions when showActions is false', () => {
    const { queryByText } = render(
      <QuestCard
        quest={mockQuest}
        {...mockHandlers}
        showActions={false}
      />
    );

    expect(queryByText('Select')).toBeFalsy();
    expect(queryByText('Complete')).toBeFalsy();
    expect(queryByText('Skip')).toBeFalsy();
  });
});

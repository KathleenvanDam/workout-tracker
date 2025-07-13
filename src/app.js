import React, { useState, useEffect } from 'react';
import { Check, Calendar, Trophy, Target, Flame } from 'lucide-react';

const WorkoutTracker = () => {
  // Get current date
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [workouts, setWorkouts] = useState({});
  const [view, setView] = useState('week'); // 'week' or 'month'

  // Preferred workout days (0 = Sunday, 1 = Monday, etc.)
  const preferredDays = [2, 3, 5, 6]; // Tuesday, Wednesday, Friday, Saturday

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get week start (Monday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Get current week dates
  const getCurrentWeekDates = () => {
    const weekStart = getWeekStart(currentDate);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Get month dates for calendar view
  const getMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);
    
    // Start from the first Monday of the month view
    const dayOfWeek = firstDay.getDay();
    startDate.setDate(firstDay.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    // End on the last Sunday of the month view
    const lastDayOfWeek = lastDay.getDay();
    endDate.setDate(lastDay.getDate() + (lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek));

    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // Format date as key
  const getDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Toggle workout completion
  const toggleWorkout = (date) => {
    const key = getDateKey(date);
    setWorkouts(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Get week's workout count
  const getWeekWorkoutCount = (weekDates) => {
    return weekDates.filter(date => workouts[getDateKey(date)]).length;
  };

  // Get current streak
  const getCurrentStreak = () => {
    let streak = 0;
    const weekStart = getWeekStart(today);
    let currentWeek = new Date(weekStart);
    
    while (true) {
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeek);
        date.setDate(currentWeek.getDate() + i);
        weekDates.push(date);
      }
      
      const weekCount = getWeekWorkoutCount(weekDates);
      if (weekCount >= 4) {
        streak++;
        currentWeek.setDate(currentWeek.getDate() - 7);
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Navigate weeks/months
  const navigatePrevious = () => {
    if (view === 'week') {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() - 7);
        return newDate;
      });
    } else {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() - 1);
        return newDate;
      });
    }
  };

  const navigateNext = () => {
    if (view === 'week') {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() + 7);
        return newDate;
      });
    } else {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + 1);
        return newDate;
      });
    }
  };

  // Get month's workout statistics
  const getMonthStats = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    
    let totalWorkouts = 0;
    let weeksWithGoal = 0;
    let totalWeeks = 0;
    
    // Count workouts in the month
    const current = new Date(monthStart);
    while (current <= monthEnd) {
      if (workouts[getDateKey(current)]) {
        totalWorkouts++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    // Count weeks and weeks with goal achieved
    const firstMonday = getWeekStart(monthStart);
    let weekStart = new Date(firstMonday);
    
    while (weekStart <= monthEnd) {
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        weekDates.push(date);
      }
      
      // Only count weeks that have at least one day in the current month
      const hasMonthDays = weekDates.some(date => date.getMonth() === month);
      if (hasMonthDays) {
        totalWeeks++;
        if (getWeekWorkoutCount(weekDates) >= 4) {
          weeksWithGoal++;
        }
      }
      
      weekStart.setDate(weekStart.getDate() + 7);
    }
    
    return { totalWorkouts, weeksWithGoal, totalWeeks };
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const currentWeekDates = getCurrentWeekDates();
  const currentWeekCount = getWeekWorkoutCount(currentWeekDates);
  const monthDates = getMonthDates();
  const monthStats = getMonthStats();
  const streak = getCurrentStreak();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Workout Tracker</h1>
              <p className="text-gray-600">Stay consistent with your fitness goals</p>
            </div>
          </div>
        </div>

        {/* Goal Achievement Banner */}
        {currentWeekCount >= 4 && view === 'week' && (
          <div className="bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-lg mb-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2" />
            <p className="font-bold text-lg">🎉 Goal Achieved! 🎉</p>
            <p>You've completed all 4 workouts this week!</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={navigatePrevious}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
          >
            ← Previous
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {view === 'week' 
                ? `Week of ${currentWeekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${currentWeekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              }
            </h2>
            <button
              onClick={goToToday}
              className="text-blue-500 hover:text-blue-700 text-sm mt-1"
            >
              Go to Today
            </button>
          </div>
          
          <button
            onClick={navigateNext}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
          >
            Next →
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === 'week' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Week View
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === 'month' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Month View
          </button>
        </div>

        {/* Calendar */}
        {view === 'week' ? (
          <div className="grid grid-cols-7 gap-2 mb-6">
            {currentWeekDates.map((date, index) => {
              const isCompleted = workouts[getDateKey(date)];
              const isPreferred = preferredDays.includes(date.getDay());
              const isToday = date.toDateString() === today.toDateString();
              
              return (
                <div key={index} className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    {dayNames[index]}
                  </div>
                  <button
                    onClick={() => toggleWorkout(date)}
                    className={`w-full h-16 rounded-lg border-2 transition-all duration-200 flex items-center justify-center relative ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isPreferred
                        ? 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
                  >
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${isCompleted ? 'text-white' : 'text-gray-700'}`}>
                        {date.getDate()}
                      </div>
                      {isCompleted && (
                        <Check className="w-5 h-5 text-white absolute top-1 right-1" />
                      )}
                      {isPreferred && !isCompleted && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full absolute bottom-1 right-1"></div>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 mb-6">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
            {monthDates.map((date, index) => {
              const isCompleted = workouts[getDateKey(date)];
              const isPreferred = preferredDays.includes(date.getDay());
              const isToday = date.toDateString() === today.toDateString();
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              
              return (
                <button
                  key={index}
                  onClick={() => toggleWorkout(date)}
                  className={`h-10 text-sm rounded transition-all duration-200 flex items-center justify-center relative ${
                    !isCurrentMonth
                      ? 'text-gray-300'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : isPreferred
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
                >
                  {date.getDate()}
                  {isCompleted && (
                    <Check className="w-3 h-3 text-white absolute top-0 right-0" />
                  )}
                  {isPreferred && !isCompleted && isCurrentMonth && (
                    <div className="w-1 h-1 bg-blue-400 rounded-full absolute bottom-0 right-0"></div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Weekly Goals or Monthly Tracker */}
        {view === 'week' ? (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Goals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-blue-800 font-medium">Target</p>
                    <p className="text-sm text-blue-600">4 workouts per week</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-green-800 font-medium">Progress</p>
                    <p className="text-sm text-green-600">{currentWeekCount} of 4 completed</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Preferred days:</strong> Tuesday, Wednesday, Friday, Saturday
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Feel free to adjust days as needed - just aim for 4 workouts total!
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Tracker</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-blue-800 font-medium">Total Workouts</p>
                    <p className="text-sm text-blue-600">{monthStats.totalWorkouts} completed this month</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-green-800 font-medium">Success Rate</p>
                    <p className="text-sm text-green-600">{monthStats.totalWeeks > 0 ? Math.round((monthStats.weeksWithGoal / monthStats.totalWeeks) * 100) : 0}% of weeks hit goal</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Monthly target:</strong> {monthStats.totalWeeks * 4} workouts ({monthStats.totalWeeks} weeks × 4 workouts/week)
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Progress:</strong> {monthStats.totalWorkouts}/{monthStats.totalWeeks * 4} workouts completed
              </p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded"></div>
            <span className="text-gray-600">Preferred days (Tue, Wed, Fri, Sat)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">Completed workout</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-400 rounded"></div>
            <span className="text-gray-600">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

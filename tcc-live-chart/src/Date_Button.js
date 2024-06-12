import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateInputButton = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleButtonClick = () => {
    alert(`Selected Date: ${selectedDate ? selectedDate.toLocaleDateString() : 'None'}`);
  };

  return (
    <div>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="yyyy/MM/dd"
        placeholderText="Select a date"
      />
      <button onClick={handleButtonClick}>Submit</button>
    </div>
  );
};

export default DateInputButton;

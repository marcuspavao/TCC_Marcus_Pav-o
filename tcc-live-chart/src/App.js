import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, Colors, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-moment';
import './App.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useQuery, useSubscription } from '@apollo/client';
import gql from 'graphql-tag';
import moment from 'moment';

Chart.register(CategoryScale, Colors, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

const TWENTY_MIN_TEMP_SUBSCRIPTION = gql`
  subscription {
    last_20_min_temp_correct_2(order_by: { five_sec_interval: asc }) {
      five_sec_interval
      max_temp
    }
  }
`;

const QUERY_DATA = gql`
  query($dateLimit: timestamptz!) {
    data_sensors(where: { date: { _gte: $dateLimit } }) {
      sensor_data
      date
    }
  }
`;

const QueryAllData = ({ dataLimit }) => {
  const { data, error, loading } = useQuery(QUERY_DATA, {
    variables: { dateLimit: dataLimit ? dataLimit.toISOString() : new Date().toISOString() }
  });
  console.log(data)

  if (error) {
    console.error(error);
    return "Erro ao gerar o Gráfico";
  }
  if (loading) {
    return "Loading";
  }

  const chartJSData = {
    labels: [],
    datasets: [{
      label: "Sensor Data",
      data: [],
      pointBackgroundColor: [],
      // borderColor: 'brown',
      fill: false,
      //tension: 0.1 Curva do grafico

    }]
  };

  data.data_sensors.forEach(item => {
    chartJSData.labels.push(item.date);
    chartJSData.datasets[0].data.push(item.sensor_data.temperature);
    chartJSData.datasets[0].pointBackgroundColor.push('green');
  });

  return (
    <Line
      data={chartJSData}
      options={{
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              tooltipFormat: 'll LTS',
              unit: 'minute',
              displayFormats: {
                minute: 'MMM D, h:mm a',
                hour: 'MMM D, h:mm a'
              }
            },
            title: {
              display: true,
              text: 'Date and Time'
            }
          }
        },
        
  elements: {
    line: {
      borderWidth: 3, // Increase line thickness
      borderColor: 'green' // Set line color to green
    }
  }, 
        plugins: {
          colors: {
            enabled: true,
            forceOverride: true
          }
        }
      }}
    />
  );
};

const Last20min = () => {
  const { data, error, loading } = useSubscription(TWENTY_MIN_TEMP_SUBSCRIPTION);

  if (error) {
    console.error(error);
    return "Erro ao gerar o Gráfico";
  }
  if (loading) {
    return "Loading";
  }

  const chartJSData = {
    labels: [],
    datasets: [{
      label: "Max temperature every five seconds",
      data: [],
      pointBackgroundColor: [],
      borderColor: 'brown',
      fill: false
    }]
  };

  data.last_20_min_temp_correct_2.forEach(item => {
    chartJSData.labels.push(item.five_sec_interval);
    chartJSData.datasets[0].data.push(item.max_temp);
    chartJSData.datasets[0].pointBackgroundColor.push('brown');
  });

  return (
    <Line
      data={chartJSData}
      options={{
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              tooltipFormat: 'll LTS',
              unit: 'minute',
              displayFormats: {
                minute: 'MMM D, h:mm a',
                hour: 'MMM D, h:mm a'
              }
            },
            title: {
              display: true,
              text: 'Date and Time'
            }
          },
          y: {
            ticks: {
              min: 5,
              max: 20
            }
          }
        },
        animation: { duration: 0 },
        elements: {
          line: {
            borderWidth: 3, // Increase line thickness
            borderColor: 'green' // Set line color to green
          }
        }, 
              plugins: {
                colors: {
                  enabled: true,
                  forceOverride: true
                }
              }
      }}
    />
  );
};

function App() {
  const [isGraph1, setIsGraph1] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerShown, setIsDatePickerShown] = useState(true);


  const handleDateChange = date => {
    setSelectedDate(date);
  };

  const handleClick = () => {
    setIsGraph1(!isGraph1);
    setIsDatePickerShown(!isDatePickerShown);
  };

  return (
    <div className="app-container">
      <div className="button-container">
      <div className="text-box">Gráficos - TCC</div>
        <button onClick={handleClick} className="custom-button">
          {isGraph1 ? 'Selecione uma data' : 'Gráfico 20 minutos'}
        </button>
        {isDatePickerShown && (<DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="dd/MM/yyyy"
          placeholderText="Select a date"
          className="custom-datepicker"
        />
        )}
      </div>
      <div className="chart-container">
        {isGraph1 ? (
          <QueryAllData dataLimit={selectedDate} />
        ) : (
          <Last20min />
        )}
      </div>
    </div>
  );
}

export default App;

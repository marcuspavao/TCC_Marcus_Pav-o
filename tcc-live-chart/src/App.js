import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, Colors, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-moment';
import './App.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useQuery, useSubscription } from '@apollo/client';
import gql from 'graphql-tag';
import { CSVLink } from 'react-csv';
import { now } from 'moment';

Chart.register(CategoryScale, Colors, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

const ONE_DAY_TEMP_SUBSCRIPTION = gql`
  subscription {
    last_1_day_temp (order_by: { sixty_sec : asc }) {
      sixty_sec
      max_temp
    }
  }
`;

const TWENTY_MIN_TEMP_SUBSCRIPTION = gql`
  subscription {
    last_20_min_temp_correct_2 (order_by: {  five_sec_interval: asc }) {
      five_sec_interval
      max_temp
    }
  }
`;

const QUERY_DATA = gql`
query($startDate: timestamptz!, $endDate: timestamptz!) {
  data_sensors(where: { date: { _gte: $startDate, _lte: $endDate } }) {
    sensor_data
    date
  }
}
`;

const QueryAllData = ({ startDate, endDate, onDataFetched }) => {

  //console.log(startDate, endDate)

  const { data, error, loading } = useQuery(QUERY_DATA, {
    variables: { startDate: startDate ? startDate.toISOString() : new Date().toISOString(), 
                  endDate: endDate ? endDate.toISOString() : new Date().toISOString() }
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

  onDataFetched(data.data_sensors);

  const temperatures = data.data_sensors.map(item => item.sensor_data.temperature);

  const averageTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
  const maxTemp = Math.max(...temperatures);
  const minTemp = Math.min(...temperatures);

  const customPlugin = {
    id: 'customPlugin',
    afterDraw: (chart) => {
      const { ctx, chartArea: { top, right, left, bottom }, scales: { x, y } } = chart;

      ctx.save();
      ctx.font = '16px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText(`Média: ${averageTemp.toFixed(2)}°C`, left + 10, top + 20);
      ctx.fillText(`Máximo: ${maxTemp}°C`, left + 10, top + 40);
      ctx.fillText(`Mínimo: ${minTemp}°C`, left + 10, top + 60);
      ctx.restore();
    }
  };

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
          },
          customPlugin: true
        }
      }}
      plugins={[customPlugin]}
    />
  );
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

const LastTwentyMinutes = () => {
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
      label: "Average temperature every 5 seconds",
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

const LastDay = () => {
  const { data, error, loading } = useSubscription(ONE_DAY_TEMP_SUBSCRIPTION);

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
      label: "Average temperature every 1 minute",
      data: [],
      pointBackgroundColor: [],
      borderColor: 'brown',
      fill: false
    }]
  };

  data.last_1_day_temp.forEach(item => {
    chartJSData.labels.push(item.sixty_sec);
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

// function App() {
//   const [isGraph1, setIsGraph1] = useState(true);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [isDatePickerShown, setIsDatePickerShown] = useState(true);


//   const handleDateChange = date => {
//     setSelectedDate(date);
//   };

//   const handleClick = () => {
//     setIsGraph1(!isGraph1);
//     setIsDatePickerShown(!isDatePickerShown);
//   };

//   return (
//     <div className="app-container">
//       <div className="button-container">
//       <div className="text-box">Gráficos - TCC</div>
//         <button onClick={handleClick} className="custom-button">
//           {isGraph1 ? 'Selecione uma data' : 'Gráfico 20 minutos'}
//         </button>
//         {isDatePickerShown && (<DatePicker
//           selected={selectedDate}
//           onChange={handleDateChange}
//           dateFormat="dd/MM/yyyy"
//           placeholderText="Select a date"
//           className="custom-datepicker"
//         />
//         )}
//       </div>
//       <div className="chart-container">
//         {isGraph1 ? (
//           <QueryAllData dataLimit={selectedDate} />
//         ) : (
//           isGraph2 ? (<LastDay />) : LastTwentyMinutes 
//         )}
//       </div>
//     </div>
//   );
// }


const ExportCSV = ({ data }) => {
  // Convert the data to CSV format
  const csvData = data.map(item => ({
    date: item.date ,
    temperature: item.sensor_data?.temperature 
  }));

  return (
    <div>
      <CSVLink data={csvData} filename={`dados_${now()}.csv`}>
        Export to CSV
      </CSVLink>
    </div>
  );
};

function App(){
const [graphType, setGraphType] = useState('date');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [data, setData] = useState([]);

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleDataFetched = (fetchedData) => {
    setData(fetchedData);
  };


const handleGraphToggle = () => {
  setGraphType(prevType => {
    switch (prevType) {
      case 'date':
        return 'lastDay';
      case 'lastDay':
        return 'lastTwentyMinutes';
      case 'lastTwentyMinutes':
        return 'date';
      default:
        return 'date'; 
    }
  });
};

return (
  <div className="app-container">
    <div className="button-container">
      <div className="text-box">
        <div className='title-box'>Gráficos - TCC</div>
        {graphType === 'date' && <div class="export-box"> <ExportCSV data={data}/></div>}
      </div>
      <button onClick={handleGraphToggle} className="custom-button">
        {graphType === 'date' && 'Selecione uma data'}
        {graphType === 'lastDay' && 'Gráfico 1 Dia'}
        {graphType === 'lastTwentyMinutes' && 'Gráfico 20 Minutos'}
      </button>
      {graphType === 'date' && (
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsStart
            showTimeSelect
            dateFormat="dd/MM/yyyy HH:mm"
            timeIntervals={15}
            placeholderText="Start Date"
            className="custom-datepicker"
          /> )}
          {graphType === 'date' && (
          <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsEnd
            showTimeSelect
            dateFormat="dd/MM/yyyy HH:mm"
            timeIntervals={15}
            placeholderText="End Date"
            minDate={startDate}
            className="custom-datepicker"
          />
        )}
    </div>
    <div className="chart-container">
      {graphType === 'date' && <QueryAllData startDate={startDate} endDate={endDate} onDataFetched={handleDataFetched}/>}
      {graphType === 'lastDay' && <LastDay />}
      {graphType === 'lastTwentyMinutes' && <LastTwentyMinutes />}
    </div>
  </div>
);
}

export default App;

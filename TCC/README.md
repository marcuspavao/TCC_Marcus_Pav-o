.ENV => Contém as informações:
- URL do servidor MQTT
- URL do banco de dados Postgres

Docker Compose
- docker-compose down -v 
- docker-compose up -d 

Criação de migrations
- diesel migration generate create_posts

Para rodar todas as migrations e preparar banco
- diesel migration run
- diesel migration redo

ADICIONAR LOG DE ERRO PARA QUANDO NAO FOR POSSIVEL INSERIR DADO EM BANCO DE DADOS

Exemplo para criação de Sensor

```json 
{
"name": "Sensor 1",
"description": "Sensor presente na mina 2",
"local": "Mariana"
}
```

Exemplo para envio de dados para Sensor

```json
{
"sensor_id": 1,
"sensor_data": {"umidade": 312, "temperature": 25.4}
}
```
query {
  data_sensors {
    sensor_data
    date
  }
}


- Insert data with
mutation {
  insert_data_sensors ( 
  objects: [{
    sensor_data:
    		{temperature: 12}
    sensor_id: 1
  }]
  )
  {
      returning {
     		sensor_data 
        date
      }
    } 
}

- Create a view that will be responsible to give the data we need

- Track the view

- Subscription to the view

subscription {
  last_20_min_temp_correct_2 (
    order_by: {
      five_sec_interval: asc
    }
  ) 
  {
    five_sec_interval
    max_temp
  }
}


- Testar o uso de JSON para diferentes nomes e tentar impedir que pegue quando for nulo
ou seja quando a query enviar a umidade a view de temperatura deve desconsiderar
const { Kafka } = require('kafkajs');
const path = require('path');
const fs = require('fs');

const kafka = new Kafka({ brokers: ['localhost:9092'] });
const consumer = kafka.consumer();

const handlers = {};

// Автоматически загружаем все обработчики из папки
const handlersDir = path.join(__dirname, 'handlers');
fs.readdirSync(handlersDir).forEach(file => {
  if (file.endsWith('Handler.js')) {
    const eventName = file.replace('Handler.js', '').replace(/([A-Z])/g, '.$1').toLowerCase();
    handlers[eventName] = require(path.join(handlersDir, file));
  }
});

const setupKafkaConsumer = async () => {
  await consumer.connect();

  // Автоматически подписываемся на все топики из handlers
  for (const topic of Object.keys(handlers)) {
    await consumer.subscribe({ topic, fromBeginning: false });
    console.log(`Подписан на Kafka топик: ${topic}`);
  }

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());
      const handler = handlers[topic];

      if (handler) {
        try {
          await handler({ data });
        } catch (err) {
          console.error(`Ошибка при обработке события ${topic}`, err);
        }
      } else {
        console.warn(`Нет обработчика для топика: ${topic}`);
      }
    }
  });
};

module.exports = setupKafkaConsumer;
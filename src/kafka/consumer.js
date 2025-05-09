const { Kafka } = require('kafkajs');
const userConnectedHandler = require('./handlers/userConnectedHandler');
const userRegisteredHandler = require('./handlers/userRegisteredHandler');


const kafka = new Kafka({ brokers: ['localhost:9092']});
const consumer = kafka.consumer();


const handlers = {
    'user.connected': userConnectedHandler,
    'user.registered': userRegisteredHandler, 
}

const setupKafkaConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'user.connected', fromBeginning: false });

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
            }cd 
        }
    })
}

module.exports = setupKafkaConsumer;
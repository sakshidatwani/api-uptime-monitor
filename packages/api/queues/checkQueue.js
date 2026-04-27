require('dotenv').config();

const {Queue} = require('bullmq');
const QUEUE_NAME = 'checks';

const redisConnectionOptions = {
    connection:{
        url: process.env.REDIS_URI ? process.env.REDIS_URI : 'redis://127.0.0.1:6379',
    },
};

const  checkQueue = new Queue(QUEUE_NAME, redisConnectionOptions);

/**
 * Adds a new check job to the queue.
 * This function will be called from our `checksController` whenever a new check is created or updated.
 *
 * @param {object} check - The Mongoose 'Check' document.
 */

const addCheckJob = async(check)=>{
    try{
        await checkQueue.add('process-check', { checkId: check._id.toString() });
        console.log(`Job added to queue for Check ID: ${check._id}`);
    }
    catch(error){
        console.error(`Failed to add job for Check ID: ${check._id}`, error);
    }
}

module.exports= {
    checkQueue, 
    addCheckJob,
}
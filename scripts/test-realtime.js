const { recordTransaction } = require('./src/lib/audit');

(async () => {
    try {
        console.log('Recording dummy transaction...');
        await recordTransaction('ROOM', 999.99, 'dummy-source-id');
        console.log('Success!');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
})();

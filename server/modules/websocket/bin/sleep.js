async function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
}

module.exports = sleep;
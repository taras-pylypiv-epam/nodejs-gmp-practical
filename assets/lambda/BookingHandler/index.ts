exports.handler = async () => {
    return {
        body: JSON.stringify({ message: 'Hello World' }, null, 2),
        statusCode: 200,
    };
};

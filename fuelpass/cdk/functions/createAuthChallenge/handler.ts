const AWS = require('aws-sdk');

exports.handler = (event: any, context: any, callback: any) => {
    //Create a random number for otp
    const challengeAnswer = Math.random().toString(10).substr(2, 6);
    const phoneNumber = event.request.userAttributes.phone_number;

    //For Debugging
    console.log(event, context);

    //sns sms
    const sns = new AWS.SNS({ region: 'us-east-1' });
    sns.publish(
        {
            Message: 'Your OTP: ' + challengeAnswer,
            PhoneNumber: phoneNumber,
            MessageStructure: 'string',
            MessageAttributes: {
                'AWS.SNS.SMS.SenderID': {
                    DataType: 'String',
                    StringValue: 'AMPLIFY',
                },
                'AWS.SNS.SMS.SMSType': {
                    DataType: 'String',
                    StringValue: 'Transactional',
                },
            },
        },
        function (err: any, data: any) {
            if (err) {
                console.log(err.stack);
                console.log(data);
                return;
            }
            console.log(`SMS sent to ${phoneNumber} and otp = ${challengeAnswer}`);
            return data;
        }
    );

    //set return params
    event.response.privateChallengeParameters = {};
    event.response.privateChallengeParameters.answer = challengeAnswer;
    event.response.challengeMetadata = 'CUSTOM_CHALLENGE';

    callback(null, event);
};
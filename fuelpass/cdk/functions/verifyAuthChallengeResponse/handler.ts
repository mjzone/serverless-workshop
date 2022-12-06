exports.handler = (event: any, context: any) => {
    console.log(event);
    if (
        event.request.privateChallengeParameters.answer === event.request.challengeAnswer
    ) {
        event.response.answerCorrect = true;
    } else {
        event.response.answerCorrect = false;
    }
    context.done(null, event);
};
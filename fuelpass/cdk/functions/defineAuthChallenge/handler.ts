exports.handler = (event:any, context:any) => {
    // No existing cognito session
    if (event.request.session.length === 0) {
        event.response.issueTokens = false;
        event.response.failAuthentication = false;
        event.response.challengeName = 'CUSTOM_CHALLENGE';
    }
    // Existing cognito session is available
    else if (
        event.request.session.length === 1 &&
        event.request.session[0].challengeName === 'CUSTOM_CHALLENGE' &&
        event.request.session[0].challengeResult === true
    ) {
        event.response.issueTokens = true;
        event.response.failAuthentication = false;
    }
    else {
        event.response.issueTokens = false;
        event.response.failAuthentication = true;
    }
    context.done(null, event);
};

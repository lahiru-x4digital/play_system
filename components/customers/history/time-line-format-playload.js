export const formatFeedbackPayload = (actionType, payload) => {
    if (actionType === 'feedback') {
        if (payload.key_name === 'submited') {
            return payload.after ? 'Feedback Submitted' : 'Feedback Link Sent';
        }
      return "s"
    }
    return payload;
};

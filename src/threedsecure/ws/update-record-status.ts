export async function updateRecordStatus(actionCode: string, merchantTrackId: string, errorNumber?: string, errorMessage?: string): Promise<void> {
  const url = new URL('/ws/threedsecureserver-record', EBANX.utils.api.path());

  const data = {
    status: actionCode,
    merchantTrackId,
    publicIntegrationKey: EBANX.config.getPublishableKey(),
    errorNumber,
    errorMessage,
  };
  
  await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(data),
  });
}

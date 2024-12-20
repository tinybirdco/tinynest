# Send Resend webhooks to Tinybird

With [Resend](https://resend.com/) you can send and receive emails programmatically. By integrating Resend with Tinybird, you can analyze your email data in real time.

Some common use cases for sending Resend webhooks to Tinybird include:

1. Tracking email opens and clicks.
2. Monitoring delivery rates and bounces.
3. Analyzing user engagement patterns.
4. Creating custom dashboards for email performance.
5. Enriching other data sources with real-time email metrics.

Read on to learn how to send data from Resend to Tinybird.

## Before you start

Before you connect Resend to Tinybird, ensure:

* You have a Resend account.
* You have a Tinybird Workspace.

## Connect Resend to Tinybird

1. Open the Resend UI and go to the Webhooks page.
   
2. Select "Add Webhook".

3. Go to your Tinybird Workspace, create a new Data Source and select the Events API. From the dialog, copy the API URL.

4. Paste this into the Webhook URL field. The end of URL has a search parameter `name` that you can customize to give your Data Source a name. The URL looks like: `https://api.tinybird.co/v0/events?name=your_data_source_name`.

5. Return to the dialog in Tinybird, and copy the token from the Authorization header. The token looks like: `p.eyXXXXX`.

6. Return to the Resend Webhooks page, and update the URL to add a new search parameter `token` with the token you copied. The URL looks like: `https://api.tinybird.co/v0/events?name=your_data_source_name&token=p.eyXXXXX`.

7. Select the checkboxes for the Resend events you want to send to Tinybird, and select "Add".

8. You're done. Sending emails to Resend will now push events to Tinybird via the [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).
   
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).

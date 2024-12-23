# Connect Sentry to Tinybird

1. In Sentry, go to **Settings** > **Developer Settings** > **Custom Integrations**.
   
2. Select **Create New Integration**.

3. In Tinybird, go to Tokens, and copy the `append` token.

4. Back in Sentry, paste the Events API URL in your Webhook URL. Use the query parameter `name=sentry` and `token=<your token>`. For example:

```
https://api.tinybird.co/v0/events?name=sentry&token=TOKEN
```

5. Select **Alert Rule Action**.

6. In the **Permissions** box, select **Issue and Event** > **Read**.

7. Check all webhooks and **Save Changes**.

8. If you also want to send alerts to Tinybird, select **Alerts** from the left menu, click on an alert and select **Edit Rule**. You can select **Send Notifications** via your previously created Custom Integration.

9.  You can then select **Send Test Notification** to check the connection.

10. You're done. Sentry events are automatically sent to Tinybird via the [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).
   
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).

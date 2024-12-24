# Connect Vercel to Tinybird

1. Choose your team scope on the dashboard, and go to **Team Settings** > **Log Drains**.
   
2. Select the **Projects** to send logs to Tinybird.

3. Select **Sources** you want to send logs to Tinybird.

4. Select **NDJSON** as Delivery Format.

5. Select **Environments** and **Sampling Rate**.

6. In Tinybird, go to Tokens, and copy the `append` token.

7. Back in Vercel, paste the Events API URL in your Webhook URL. Use the query parameter `name=vercel_logs`. For example:

```
https://api.tinybird.co/v0/events?name=vercel_logs
```

8. The Vercel Log Drains webhook needs to be verified by Vercel. You can do this by adding the `x-vercel-verify` parameter to the request.

```
https://api.tinybird.co/v0/events?name=vercel_logs&x-vercel-verify=<your-x-vercel-verify-token>
```

9. Select **Custom Headers**, add `Authorization` with the value `Bearer <your-tinybird-token>` and select **Add**.

10.  Select **Verify** and optionally use **Test Log Drain** from Vercel to check data gets to the `vercel_logs` Data Source in Tinybird.

11.  You're done. Any of the Vercel Log Drains you selected is automatically sent to Tinybird through the [Events API](/get-data-in/ingest-apis/events-api).

Check the status of the from the **Log** tab in the Tinybird `vercel_logs` Data Source. 
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api)
* [Vercel Log Drains](https://vercel.com/docs/observability/log-drains/log-drains-reference)

# Send Vercel log drains to Tinybird

[Vercel](https://vercel.com) is a platform for building and deploying web applications. By integrating Vercel with Tinybird, you can analyze your Vercel events in real time and enrich it with other data sources.

Some common use cases for sending Vercel Log Drains to Tinybird include:

1. Analyze logs from your applications.
2. Monitor logs from your applications.
3. Create custom analytical dashboards.
4. Build an alert system based on logging patterns.

Read on to learn how to send logs from Vercel to Tinybird.

## Before you start

Before you connect Vercel Log Drains to Tinybird, ensure:

* You have a Vercel account.
* You have a Tinybird Workspace.

## Connect Vercel to Tinybird

1. Choose your team scope on the dashboard, and go to **Team Settings** > **Log Drains**.
   
2. Select the **Projects** to send logs to Tinybird.

3. Select **Sources** you want to send logs to Tinybird.

4. Select **NDJSON** as Delivery Format.

5. Select **Environments** and **Sampling Rate**.

6. In Tinybird, create a Data Source, called `vercel_logs` in this example, with the following schema:

```tb {% title = 'Data Source schema for Vercel webhooks %}
SCHEMA >
    `id` Nullable(String) `json:$.id`,
    `message` String `json:$.message` DEFAULT '',
    `date` DateTime64(3) `json:$.timestamp` DEFAULT now(),
    `type` LowCardinality(String) `json:$.type` DEFAULT '',
    `request_id` Nullable(String) `json:$.requestId`,
    `status_code` Nullable(UInt16) `json:$.statusCode`,
    `project_id` String `json:$.projectId` DEFAULT '',
    `project_name` Nullable(String) `json:$.projectName`,
    `deployment_id` Nullable(String) `json:$.deploymentId`,
    `source` LowCardinality(String) `json:$.source` DEFAULT '',
    `host` Nullable(String) `json:$.host`,
    `path` Nullable(String) `json:$.path`,
    `destination` Nullable(String) `json:$.destination`,
    `proxy` String `json:$.proxy` DEFAULT '',
    `level` LowCardinality(String) `json:$.level` DEFAULT '',
    `execution_region` Nullable(String) `json:$.executionRegion`,
    `environment` Nullable(String) `json:$.environment`,
    `branch` Nullable(String) `json:$.branch`,
    `build_id` Nullable(String) `json:$.buildId`,
    `entrypoint` Nullable(String) `json:$.entrypoint`

ENGINE "MergeTree"
ENGINE_PARTITION_KEY "toYYYYMM(date)"
ENGINE_SORTING_KEY "project_id, date"
```

The proxy column is a JSON string. Use the [JSONExtract](/sql-reference/functions/json-functions) functions to extract the data you need in your Pipes.


7. In Tinybird, copy a token with privileges to append to the Data Source you created. You can use the admin token or create one with the required scope.

8. Back in Vercel, paste the Events API URL in your Log Drains Endpoint. Use the query parameter `name` to match the name of the Data Source you created in Tinybird.

Log Drains webhook needs to be verified by Vercel. You can do this by adding the `x-vercel-verify` parameter to the request.

```
https://api.tinybird.co/v0/events?name=vercel_logs&x-vercel-verify=<your-x-vercel-verify-token>
```

1. Select **Custom Headers**, add `Authorization` with the value `Bearer <your-tinybird-token>` and select **Add**.

2.  Select **Verify** and optionally use **Test Log Drain** from Vercel to check data gets to the `vercel_logs` Data Source in Tinybird.

3.  You're done. Any of the Vercel Log Drains you selected is automatically sent to Tinybird through the [Events API](/get-data-in/ingest-apis/events-api).

Check the status of the from the **Log** tab in the Tinybird `vercel_logs` Data Source. 
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api)
* [Vercel Log Drains](https://vercel.com/docs/observability/log-drains/log-drains-reference)

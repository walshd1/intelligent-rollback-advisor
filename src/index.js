const core = require('@actions/core');
const fs = require('fs');
const PROMPT = `You are an Intelligent Rollback Advisor. Your task is to analyze recent commits and deployment logs to suggest the most likely commit to rollback to in case of a failure.

Here's the information you have:

**Recent Commits:**
{recent_commits}

**Deployment Logs:**
{deployment_logs}

**Current System State (Optional):**
{current_system_state}

**Error Description:**
{error_description}

**User Request:**
Based on the information provided, recommend the most suitable commit to rollback to in order to resolve the reported error. Explain your reasoning, considering factors such as:

*   Which commit is most likely to have introduced the error based on the error description and the changes introduced in each commit.
*   The impact of rolling back to each potential commit (e.g., how much code would be reverted).
*   The stability of previous deployments associated with each commit (if available in the deployment logs).
*   Any dependencies or conflicts that might arise from rolling back to a specific commit.

**Output Format:**

Provide your recommendation in the following format:

**Recommended Rollback Commit:** '{recommended_commit_hash}'

**Reasoning:** {detailed_reasoning_for_rollback_recommendation}

**Potential Risks/Considerations:** {any_potential_risks_or_considerations_related_to_the_rollback}`;
async function run() {
  try {
    const key = core.getInput('gemini_api_key');
    const token = core.getInput('service_token');
    const ctx = { repoName: process.env.GITHUB_REPOSITORY || '', event: process.env.GITHUB_EVENT_NAME || '' };
    try { Object.assign(ctx, JSON.parse(fs.readFileSync('package.json', 'utf8'))); } catch {}
    let prompt = PROMPT;
    for (const [k, v] of Object.entries(ctx)) prompt = prompt.replace(new RegExp('{' + k + '}', 'g'), String(v || ''));
    let result;
    if (key) {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 2000 } })
      });
      result = (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (token) {
      const r = await fetch('https://action-factory.walshd1.workers.dev/generate/intelligent-rollback-advisor', {
        method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx)
      });
      result = (await r.json()).content || '';
    } else throw new Error('Need gemini_api_key or service_token');
    console.log(result);
    core.setOutput('result', result);
  } catch (e) { core.setFailed(e.message); }
}
run();

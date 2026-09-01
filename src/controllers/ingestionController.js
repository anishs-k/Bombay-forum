const ingestionService = require('../services/ingestionService');
const { Ingested, Setting } = require('../models');
const { DEFAULT_LLM_PROMPT } = require('../config/constants');

async function triggerIngestion(req, res) {
  try {
    const { sourceId } = req.body;
    // Launch in background so client gets response immediately and can poll logs
    ingestionService.runPipeline(sourceId).catch(err => {
      console.error('Ingestion trigger error:', err);
    });

    res.json({
      success: true,
      message: 'Content Ingestion pipeline started successfully. You can monitor live logs.',
      status: 'running'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getIngestionLogs(req, res) {
  try {
    const logs = ingestionService.getLogs();
    res.json({
      success: true,
      isRunning: ingestionService.isRunning,
      data: logs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getIngestedList(req, res) {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { sourceName: { $regex: search, $options: 'i' } },
        { sourceUrl: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await Ingested.countDocuments(query);
    const items = await Ingested.find(query, { createdAt: -1 }, limitNum, skip);

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getSettings(req, res) {
  try {
    const prompt = await Setting.findOne({ key: 'llm_prompt_template' });
    const threshold = await Setting.findOne({ key: 'confidence_threshold' });
    const geminiKey = await Setting.findOne({ key: 'gemini_api_key' });
    const webhook = await Setting.findOne({ key: 'publish_webhook_url' });
    const instagramToken = await Setting.findOne({ key: 'instagram_access_token' });

    res.json({
      success: true,
      data: {
        promptTemplate: prompt?.value || DEFAULT_LLM_PROMPT,
        confidenceThreshold: threshold?.value !== undefined ? threshold.value : 0.7,
        geminiApiKey: geminiKey?.value ? '••••••••' + geminiKey.value.slice(-4) : '',
        hasGeminiKey: !!(geminiKey?.value || process.env.GEMINI_API_KEY),
        publishWebhookUrl: webhook?.value || '',
        instagramAccessToken: instagramToken?.value ? '••••••••' + instagramToken.value.slice(-4) : ''
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function updateSettings(req, res) {
  try {
    const { promptTemplate, confidenceThreshold, geminiApiKey, publishWebhookUrl, instagramAccessToken } = req.body;

    if (promptTemplate !== undefined) {
      await Setting.updateOne({ key: 'llm_prompt_template' }, { value: promptTemplate });
      const exists = await Setting.findOne({ key: 'llm_prompt_template' });
      if (!exists) await Setting.create({ key: 'llm_prompt_template', value: promptTemplate });
    }

    if (confidenceThreshold !== undefined) {
      const val = parseFloat(confidenceThreshold);
      await Setting.updateOne({ key: 'confidence_threshold' }, { value: val });
      const exists = await Setting.findOne({ key: 'confidence_threshold' });
      if (!exists) await Setting.create({ key: 'confidence_threshold', value: val });
    }

    if (geminiApiKey && !geminiApiKey.includes('••••')) {
      await Setting.updateOne({ key: 'gemini_api_key' }, { value: geminiApiKey });
      const exists = await Setting.findOne({ key: 'gemini_api_key' });
      if (!exists) await Setting.create({ key: 'gemini_api_key', value: geminiApiKey });
    }

    if (publishWebhookUrl !== undefined) {
      await Setting.updateOne({ key: 'publish_webhook_url' }, { value: publishWebhookUrl });
      const exists = await Setting.findOne({ key: 'publish_webhook_url' });
      if (!exists) await Setting.create({ key: 'publish_webhook_url', value: publishWebhookUrl });
    }

    if (instagramAccessToken && !instagramAccessToken.includes('••••')) {
      await Setting.updateOne({ key: 'instagram_access_token' }, { value: instagramAccessToken });
      const exists = await Setting.findOne({ key: 'instagram_access_token' });
      if (!exists) await Setting.create({ key: 'instagram_access_token', value: instagramAccessToken });
    }

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  triggerIngestion,
  getIngestionLogs,
  getIngestedList,
  getSettings,
  updateSettings
};

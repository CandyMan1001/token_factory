import { useMemo, useState } from "react";
import {
  apiAccessMock,
  billingMock,
  mock,
  modelCenterMock,
  modules,
  systemMock,
  teamAuthMock,
  usageMonitorMock
} from "./data/mockData";
import type {
  ApiKeyStatus,
  ModuleKey,
  TrendLineProps
} from "./types/console";

function TrendLine({ values, color }: TrendLineProps) {
  const points = useMemo(() => {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const span = max - min || 1;

    return values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * 100;
        const y = 100 - ((v - min) / span) * 100;
        return `${x},${y}`;
      })
      .join(" ");
  }, [values]);

  return (
    <svg className="trend-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function currency(v: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0
  }).format(v);
}

function integer(v: number) {
  return new Intl.NumberFormat("zh-CN").format(v);
}

function DashboardView() {
  const [warningThreshold, setWarningThreshold] = useState(60_000);
  const [showWarningConfig, setShowWarningConfig] = useState(false);

  const lowBalance = mock.balance < warningThreshold;

  return (
    <>
      <header className="hero">
        <div>
          <p className="eyebrow">Token Factory · 企业级模型推理 MaaS</p>
          <h1>驾驶舱</h1>
          <p className="subtitle">首屏操作入口 + 全局数据总览，面向管理员、财务与开发者的联合决策中枢。</p>
        </div>
        <div className="hero-right">
          <div className="clock">{new Date().toLocaleString("zh-CN")}</div>
          <button className="btn ghost" onClick={() => setShowWarningConfig(true)}>
            设置费用预警
          </button>
        </div>
      </header>

      <section className="panel">
        <div className="panel-title-row">
          <h2>成本 & 余额</h2>
          <span className="advantage-tag">对比 AWS Bedrock: {mock.bedrockAdvantage}</span>
        </div>

        <div className="cards three">
          <article className="card spotlight">
            <p>实时余额</p>
            <h3>{currency(mock.balance)}</h3>
            <small>企业账户可用余额</small>
          </article>
          <article className="card">
            <p>当月已消费</p>
            <h3>{currency(mock.monthlyCost)}</h3>
            <small>含按量 API 与资源包</small>
          </article>
          <article className="card">
            <p>预估月末账单</p>
            <h3>{currency(mock.monthEndForecast)}</h3>
            <small>基于近 7 天平均增速预测</small>
          </article>
        </div>

        <div className="actions-row">
          <button className="btn primary">一键充值</button>
          <button className="btn secondary">购买 Token 资源包</button>
          <button className="btn secondary">购买专属实例包</button>
          <div className="threshold">
            <span>预警阈值:</span>
            <strong>{currency(warningThreshold)}</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title-row">
          <h2>GPU 资源</h2>
          <span className="muted">实时异构算力占用与近 24 小时利用率</span>
        </div>

        <div className="cards two">
          <article className="card">
            <p>H100 占用</p>
            <h3>
              {mock.gpu.cards.h100.used}/{mock.gpu.cards.h100.total}
            </h3>
            <div className="bar"><span style={{ width: `${(mock.gpu.cards.h100.used / mock.gpu.cards.h100.total) * 100}%` }} /></div>
          </article>
          <article className="card">
            <p>昇腾 910C 占用</p>
            <h3>
              {mock.gpu.cards.ascend910c.used}/{mock.gpu.cards.ascend910c.total}
            </h3>
            <div className="bar"><span style={{ width: `${(mock.gpu.cards.ascend910c.used / mock.gpu.cards.ascend910c.total) * 100}%` }} /></div>
          </article>
        </div>

        <div className="cards three">
          <article className="card">
            <p>GPU 整体利用率</p>
            <h3>{mock.gpu.utilization}%</h3>
          </article>
          <article className="card">
            <p>H100 利用率曲线</p>
            <TrendLine values={mock.gpu.h100Trend} color="#0f8f5f" />
          </article>
          <article className="card">
            <p>昇腾 910C 利用率曲线</p>
            <TrendLine values={mock.gpu.ascendTrend} color="#d66a27" />
          </article>
        </div>

        <article className="card">
          <p>私有模型 GPU 占用详情</p>
          <div className="table">
            <div className="tr head">
              <span>模型名称</span>
              <span>算力类型</span>
              <span>占用卡数</span>
              <span>利用率</span>
            </div>
            {mock.gpu.privateModels.map((m) => (
              <div className="tr" key={m.name}>
                <span>{m.name}</span>
                <span>{m.gpuType}</span>
                <span>{m.cards}</span>
                <span>{m.util}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-title-row">
          <h2>使用情况</h2>
          <span className="muted">Token 吞吐、API 调用与模型热度排行</span>
        </div>

        <div className="cards four">
          <article className="card">
            <p>今日 Token 消耗</p>
            <h3>{integer(mock.usage.tokenToday)}</h3>
            <small>昨日: {integer(mock.usage.tokenYesterday)}</small>
          </article>
          <article className="card">
            <p>输入 / 输出 Token</p>
            <h3>
              {integer(mock.usage.inputToken)} / {integer(mock.usage.outputToken)}
            </h3>
            <TrendLine values={mock.usage.tokenTrend} color="#1e6bd6" />
          </article>
          <article className="card">
            <p>实时 QPS</p>
            <h3>{mock.usage.qps}</h3>
            <small>今日总调用 {integer(mock.usage.callsToday)} 次</small>
          </article>
          <article className="card danger">
            <p>成功率 / 错误率</p>
            <h3>
              {mock.usage.successRate}% / {mock.usage.errorRate}%
            </h3>
            <small>错误率异常时将自动标红</small>
          </article>
        </div>

        <div className="split-grid">
          <article className="card">
            <p>热门模型调用 Top3</p>
            <ol className="rank-list">
              {mock.usage.topModels.map((m) => (
                <li key={m.name}>
                  <span>{m.name}</span>
                  <strong>{integer(m.calls)} 次</strong>
                </li>
              ))}
            </ol>
          </article>
          <article className="card">
            <p>快捷入口</p>
            <div className="quick-grid">
              {mock.quickActions.map((action) => (
                <button key={action} className="chip">
                  {action}
                </button>
              ))}
            </div>
            <p className="todo-title">待办提醒</p>
            <ul className="todo-list">
              {mock.todos.map((todo) => (
                <li key={todo}>{todo}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {showWarningConfig ? (
        <div className="modal-mask" role="presentation" onClick={() => setShowWarningConfig(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>设置费用预警</h3>
            <p>当余额低于此金额时，系统将弹窗与站内消息提醒。</p>
            <label htmlFor="threshold">预警金额 (CNY)</label>
            <input
              id="threshold"
              type="number"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(Number(e.target.value || 0))}
              min={0}
            />
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowWarningConfig(false)}>
                取消
              </button>
              <button className="btn primary" onClick={() => setShowWarningConfig(false)}>
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {lowBalance ? (
        <div className="warning-toast">
          余额低于预警阈值 {currency(warningThreshold)}，请尽快充值或购买资源包。
        </div>
      ) : null}
    </>
  );
}

function ModelCenterView() {
  const [tab, setTab] = useState<"public" | "private" | "config">("public");
  const [pubModels, setPubModels] = useState(modelCenterMock.publicModels);
  const [playgroundId, setPlaygroundId] = useState<string | null>(null);
  const [pgPrompt, setPgPrompt] = useState("请介绍一下你的核心能力");
  const [pgResult, setPgResult] = useState("等待调试请求...");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [activePrivId, setActivePrivId] = useState(modelCenterMock.privateModels[0].id);
  const [selectedConfigId, setSelectedConfigId] = useState(modelCenterMock.runtimeConfigs[0].modelId);
  const [configs, setConfigs] = useState(modelCenterMock.runtimeConfigs);

  const activePrivModel = modelCenterMock.privateModels.find((m) => m.id === activePrivId)
    ?? modelCenterMock.privateModels[0];
  const activeConfig = configs.find((c) => c.modelId === selectedConfigId) ?? configs[0];

  function togglePubModel(id: string) {
    setPubModels((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  }

  function updateConfig(key: string, value: number | boolean) {
    setConfigs((prev) =>
      prev.map((c) => (c.modelId === selectedConfigId ? { ...c, [key]: value } : c))
    );
  }

  function runPlayground() {
    setPgResult("正在调用模型，请稍候...");
    setTimeout(() => {
      const model = pubModels.find((m) => m.id === playgroundId);
      setPgResult(
        `[${model?.name ?? "模型"}] 响应示例：\n\n作为 Token Factory 平台核心推理引擎，我具备超长上下文理解、复杂推理链路与多语言生成能力。基于异构算力优化部署，Token 单价较行业均价低 ${model?.savings ?? 30}%，适配企业级高并发生产场景。\n\n当前上下文窗口：${model?.context}，首 Token 延迟：${model?.ttft}ms，P95 延迟：${model?.p95}ms。`
      );
    }, 1200);
  }

  return (
    <>
      <header className="hero model-hero">
        <div>
          <p className="eyebrow">Token Factory · Model Registry</p>
          <h1>模型中心</h1>
          <p className="subtitle">
            统一管理公共模型与企业私有模型，便捷选用、私有模型托管、数据实时更新，操作流程极简。
          </p>
        </div>
        <div className="hero-right">
          <button
            className="btn primary"
            onClick={() => {
              setTab("private");
              setShowUpload(true);
              setUploadStep(1);
            }}
          >
            上传私有模型
          </button>
          <button className="btn secondary">导出模型清单</button>
        </div>
      </header>

      {/* KPI Overview */}
      <section className="panel">
        <div className="cards four">
          <article className="card spotlight">
            <p>在线模型数</p>
            <h3>{modelCenterMock.kpis.onlineModels}</h3>
            <small>可立即服务请求</small>
          </article>
          <article className="card">
            <p>私有模型数</p>
            <h3>{modelCenterMock.kpis.privateModels}</h3>
            <small>企业专属权重</small>
          </article>
          <article className="card">
            <p>平均首 Token 延迟</p>
            <h3>{modelCenterMock.kpis.avgFirstTokenLatency}ms</h3>
            <small>近 24 小时均值</small>
          </article>
          <article className="card">
            <p>GPU 可用余量</p>
            <h3>{modelCenterMock.kpis.gpuRemainPercent}%</h3>
            <small>H100 + 昇腾 910C</small>
          </article>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="mc-tab-nav">
        <button
          className={`mc-tab ${tab === "public" ? "active" : ""}`}
          onClick={() => setTab("public")}
        >
          公共模型广场
        </button>
        <button
          className={`mc-tab ${tab === "private" ? "active" : ""}`}
          onClick={() => setTab("private")}
        >
          私有模型管理
        </button>
        <button
          className={`mc-tab ${tab === "config" ? "active" : ""}`}
          onClick={() => setTab("config")}
        >
          模型运行配置
        </button>
      </div>

      {/* ─── Tab: Public Model Marketplace ─── */}
      {tab === "public" && (
        <>
          <section className="panel">
            <div className="panel-title-row">
              <h2>公共模型广场</h2>
              <span className="advantage-tag">异构算力加持 · Token 单价低 30%−50%</span>
            </div>
            <div className="cards three" style={{ marginTop: 12 }}>
              {pubModels.map((m) => (
                <article
                  key={m.id}
                  className={`card model-pub-card ${m.enabled ? "pub-enabled" : "pub-disabled"}`}
                >
                  <div className="model-pub-header">
                    <div>
                      <strong className="model-pub-name">{m.name}</strong>
                      <span className="model-pub-provider">{m.provider}</span>
                    </div>
                    <label className="toggle-switch" title={m.enabled ? "点击停用" : "点击启用"}>
                      <input
                        type="checkbox"
                        checked={m.enabled}
                        onChange={() => togglePubModel(m.id)}
                      />
                      <span className="toggle-track" />
                    </label>
                  </div>

                  <p className="model-pub-desc">{m.description}</p>

                  <div className="model-hw-tags">
                    {m.hardware.map((hw) => (
                      <span key={hw} className={`hw-tag ${hw === "H100" ? "hw-h100" : "hw-ascend"}`}>
                        {hw}
                      </span>
                    ))}
                    {m.tags.map((tag) => (
                      <span key={tag} className="feature-tag">{tag}</span>
                    ))}
                  </div>

                  <div className="model-pub-metrics">
                    <div className="metric-item">
                      <span>首 Token</span>
                      <strong>{m.ttft}ms</strong>
                    </div>
                    <div className="metric-item">
                      <span>P95 延迟</span>
                      <strong>{m.p95}ms</strong>
                    </div>
                    <div className="metric-item">
                      <span>上下文</span>
                      <strong>{m.context}</strong>
                    </div>
                  </div>

                  <div className="model-pricing">
                    <div className="pricing-row">
                      <span>输入 Token</span>
                      <div className="pricing-val">
                        <strong>¥{m.inputPrice.toFixed(4)}</strong>
                        <small className="muted">/1K</small>
                        <span className="savings-badge">↓低{m.savings}%</span>
                      </div>
                    </div>
                    <div className="pricing-row">
                      <span>输出 Token</span>
                      <div className="pricing-val">
                        <strong>¥{m.outputPrice.toFixed(4)}</strong>
                        <small className="muted">/1K</small>
                      </div>
                    </div>
                  </div>

                  <div className="model-pub-actions">
                    <button
                      className="chip"
                      onClick={() => {
                        setPlaygroundId(m.id);
                        setPgResult("等待调试请求...");
                      }}
                    >
                      Playground 调试
                    </button>
                    <button className="chip">查看文档</button>
                    <button className="chip" onClick={() => setTab("config")}>
                      运行配置
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Inline Playground */}
          {playgroundId && (
            <section className="panel">
              <div className="panel-title-row">
                <h2>
                  快速调试 · {pubModels.find((m) => m.id === playgroundId)?.name}
                </h2>
                <button className="btn ghost" onClick={() => setPlaygroundId(null)}>
                  关闭
                </button>
              </div>
              <div className="split-grid">
                <div>
                  <label className="form-label">输入 Prompt</label>
                  <textarea
                    className="pg-textarea"
                    value={pgPrompt}
                    onChange={(e) => setPgPrompt(e.target.value)}
                    rows={6}
                  />
                  <div className="actions-row">
                    <button className="btn primary" onClick={runPlayground}>
                      ▶ 运行
                    </button>
                    <span className="muted">流式输出 · 无需跳转页面</span>
                  </div>
                </div>
                <div>
                  <label className="form-label">模型输出</label>
                  <div className="pg-output">{pgResult}</div>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* ─── Tab: Private Model Management ─── */}
      {tab === "private" && (
        <>
          {/* Upload Process Overview */}
          <section className="panel">
            <div className="panel-title-row">
              <h2>私有模型上传流程</h2>
              <button
                className="btn primary"
                onClick={() => {
                  setShowUpload(true);
                  setUploadStep(1);
                }}
              >
                + 新建上传任务
              </button>
            </div>
            <div className="upload-steps">
              {["上传模型权重", "选择算力规格", "启用 API 端点"].map((label, i) => (
                <div key={label} className="step-item">
                  <div className={`step-circle ${i < 2 ? "step-done" : "step-pending"}`}>
                    {i < 2 ? "✓" : i + 1}
                  </div>
                  <div className="step-label">{label}</div>
                  {i < 2 && <div className="step-connector" />}
                </div>
              ))}
            </div>
            <p className="muted" style={{ marginTop: 10, fontSize: 13 }}>
              仅需 3 步完成私有模型上传托管，无需运维干预，自动生成专属 API 端点与密钥。
            </p>
          </section>

          {/* Private Model List & Details */}
          <section className="panel">
            <div className="panel-title-row">
              <h2>已托管私有模型</h2>
              <span className="muted">{modelCenterMock.privateModels.length} 个私有模型</span>
            </div>
            <div className="split-grid">
              {/* List */}
              <article className="card list-card">
                {modelCenterMock.privateModels.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`priv-model-item ${activePrivId === m.id ? "is-active" : ""}`}
                    onClick={() => setActivePrivId(m.id)}
                  >
                    <div className="priv-model-row">
                      <strong>{m.name}</strong>
                      <span className={`status ${m.status}`}>{m.status}</span>
                    </div>
                    <div className="priv-model-row">
                      <span className={`hw-tag ${m.hardware === "H100" ? "hw-h100" : "hw-ascend"}`}>
                        {m.hardware}
                      </span>
                      <span className="muted">
                        {m.version} · {m.uploadedAt}
                      </span>
                    </div>
                  </button>
                ))}
              </article>

              {/* Detail Panels */}
              <div style={{ display: "grid", gap: 10 }}>
                {/* API Endpoint & Key */}
                <article className="card">
                  <p>专属 API 端点 &amp; 密钥</p>
                  <div className="detail-list">
                    <div>
                      <span>Endpoint</span>
                      <strong className="mono-text">{activePrivModel.endpoint}</strong>
                    </div>
                    <div>
                      <span>API Key</span>
                      <strong className="mono-text">{activePrivModel.key}</strong>
                    </div>
                    <div>
                      <span>IP 白名单</span>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {activePrivModel.ipWhitelist.map((ip) => (
                          <span key={ip} className="ip-chip">{ip}</span>
                        ))}
                        <button className="chip">+ 添加</button>
                      </div>
                    </div>
                  </div>
                </article>

                {/* Daily Data Sync */}
                <article className="card">
                  <p>数据实时更新</p>
                  <div className="sync-flow">
                    <div className="sync-step">📤 一键上传</div>
                    <div className="sync-arrow">→</div>
                    <div className="sync-step">🔬 自动向量化</div>
                    <div className="sync-arrow">→</div>
                    <div className="sync-step">📚 知识库同步</div>
                  </div>
                  <div className="detail-list" style={{ marginTop: 10 }}>
                    <div>
                      <span>最近同步</span>
                      <strong>{activePrivModel.dailySync.lastSync}</strong>
                    </div>
                    <div>
                      <span>同步状态</span>
                      <span
                        className={`status ${activePrivModel.dailySync.status === "成功" ? "在线" : "离线"}`}
                      >
                        {activePrivModel.dailySync.status}
                      </span>
                    </div>
                    <div>
                      <span>新增记录</span>
                      <strong>
                        {activePrivModel.dailySync.recordsAdded.toLocaleString()} 条 · 全部向量化
                      </strong>
                    </div>
                  </div>
                  <button className="btn primary" style={{ marginTop: 10 }}>
                    上传今日增量数据
                  </button>
                </article>
              </div>
            </div>

            {/* Version Management */}
            <div style={{ marginTop: 14 }}>
              <div className="panel-title-row">
                <h3 className="ver-title">版本管理 · {activePrivModel.name}</h3>
                <div className="actions-row" style={{ margin: 0 }}>
                  <button className="btn secondary">上传新版本</button>
                  <button className="btn ghost">设置灰度比例</button>
                </div>
              </div>
              <div className="table">
                <div className="tr head version-grid">
                  <span>版本</span>
                  <span>状态</span>
                  <span>上传时间</span>
                  <span>备注</span>
                  <span>操作</span>
                </div>
                {activePrivModel.versions.map((v) => (
                  <div key={v.version} className="tr version-grid">
                    <span className="mono-text">{v.version}</span>
                    <span className={`ver-badge ver-${v.status}`}>{v.status}</span>
                    <span>{v.uploadedAt}</span>
                    <span className="muted">{v.note}</span>
                    <span>
                      {v.status !== "当前" && <button className="chip">切换</button>}
                      {v.status === "灰度" && (
                        <button className="chip" style={{ marginLeft: 4 }}>
                          回滚
                        </button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ─── Tab: Runtime Config ─── */}
      {tab === "config" && (
        <section className="panel">
          <div className="panel-title-row">
            <h2>模型运行配置</h2>
            <select
              value={selectedConfigId}
              onChange={(e) => setSelectedConfigId(e.target.value)}
              className="config-select"
            >
              {configs.map((c) => (
                <option key={c.modelId} value={c.modelId}>
                  {c.modelName}
                </option>
              ))}
            </select>
          </div>

          <div className="cards two" style={{ marginTop: 12 }}>
            {/* Parameter Sliders */}
            <article className="card">
              <p style={{ marginBottom: 16 }}>参数调节（实时生效）</p>

              <div className="param-item">
                <div className="param-label-row">
                  <label>Temperature（创造性）</label>
                  <strong>{activeConfig.temperature.toFixed(2)}</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.01}
                  value={activeConfig.temperature}
                  onChange={(e) => updateConfig("temperature", Number(e.target.value))}
                  className="param-slider"
                />
                <div className="param-hint">
                  <span>精确</span>
                  <span>创意</span>
                </div>
              </div>

              <div className="param-item">
                <div className="param-label-row">
                  <label>Top-P（核采样）</label>
                  <strong>{activeConfig.topP.toFixed(2)}</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={activeConfig.topP}
                  onChange={(e) => updateConfig("topP", Number(e.target.value))}
                  className="param-slider"
                />
                <div className="param-hint">
                  <span>收敛</span>
                  <span>多样</span>
                </div>
              </div>

              <div className="param-item">
                <div className="param-label-row">
                  <label>上下文上限</label>
                  <strong>
                    {activeConfig.contextLimit >= 1000000
                      ? `${(activeConfig.contextLimit / 1000).toFixed(0)}K`
                      : `${Math.round(activeConfig.contextLimit / 1024)}K`}{" "}
                    Token
                  </strong>
                </div>
                <input
                  type="range"
                  min={4096}
                  max={activeConfig.maxContextLimit}
                  step={4096}
                  value={activeConfig.contextLimit}
                  onChange={(e) => updateConfig("contextLimit", Number(e.target.value))}
                  className="param-slider"
                />
                <div className="param-hint">
                  <span>4K</span>
                  <span>
                    {activeConfig.maxContextLimit >= 1000000
                      ? `${(activeConfig.maxContextLimit / 1000).toFixed(0)}K`
                      : `${Math.round(activeConfig.maxContextLimit / 1024)}K`}
                    （上限）
                  </span>
                </div>
              </div>

              <div className="actions-row" style={{ marginTop: 18 }}>
                <button className="btn primary">保存配置</button>
                <button className="btn ghost">重置默认</button>
              </div>
            </article>

            {/* Advanced Toggles */}
            <article className="card">
              <p style={{ marginBottom: 16 }}>高级选项</p>

              <div className="toggle-row">
                <div className="toggle-info">
                  <strong>长会话 Agent 模式</strong>
                  <p>适配小时级长会话，自动管理上下文压缩与分段摘要。</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={activeConfig.agentMode}
                    onChange={(e) => updateConfig("agentMode", e.target.checked)}
                  />
                  <span className="toggle-track" />
                </label>
              </div>

              <div className="toggle-row" style={{ marginTop: 14 }}>
                <div className="toggle-info">
                  <strong>KV 缓存</strong>
                  <p>缓存前缀上下文，减少重复计算，显著降低长会话延迟。</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={activeConfig.kvCache}
                    onChange={(e) => updateConfig("kvCache", e.target.checked)}
                  />
                  <span className="toggle-track" />
                </label>
              </div>

              {activeConfig.kvCache && (
                <div className="param-item" style={{ marginTop: 16 }}>
                  <div className="param-label-row">
                    <label>KV 缓存 TTL</label>
                    <strong>
                      {activeConfig.kvCacheTTL}s （{(activeConfig.kvCacheTTL / 3600).toFixed(1)}h）
                    </strong>
                  </div>
                  <input
                    type="range"
                    min={300}
                    max={14400}
                    step={300}
                    value={activeConfig.kvCacheTTL}
                    onChange={(e) => updateConfig("kvCacheTTL", Number(e.target.value))}
                    className="param-slider"
                  />
                  <div className="param-hint">
                    <span>5 分钟</span>
                    <span>4 小时</span>
                  </div>
                </div>
              )}

              <div className="detail-list" style={{ marginTop: 16 }}>
                <div>
                  <span>Agent 模式</span>
                  <span className={`status ${activeConfig.agentMode ? "在线" : "离线"}`}>
                    {activeConfig.agentMode ? "已启用" : "已关闭"}
                  </span>
                </div>
                <div>
                  <span>KV 缓存</span>
                  <span className={`status ${activeConfig.kvCache ? "在线" : "离线"}`}>
                    {activeConfig.kvCache ? "已启用" : "已关闭"}
                  </span>
                </div>
                <div>
                  <span>配置作用域</span>
                  <strong>单模型配置</strong>
                </div>
                <div>
                  <span>生效方式</span>
                  <strong>实时生效</strong>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Upload Wizard Modal */}
      {showUpload && (
        <div
          className="modal-mask"
          role="presentation"
          onClick={() => setShowUpload(false)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>上传私有模型</h3>
            <div className="wizard-steps">
              {["上传模型权重", "选择算力规格", "启用 API"].map((label, i) => (
                <div
                  key={label}
                  className={`wizard-step ${uploadStep === i + 1 ? "wz-active" : uploadStep > i + 1 ? "wz-done" : ""
                    }`}
                >
                  <div className="wizard-step-num">
                    {uploadStep > i + 1 ? "✓" : i + 1}
                  </div>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {uploadStep === 1 && (
              <div className="wizard-body">
                <label className="form-label">模型名称</label>
                <input type="text" placeholder="例: 营销文案-7B-v1.0" />
                <label className="form-label" style={{ marginTop: 12 }}>
                  选择权重文件
                </label>
                <div className="upload-zone">
                  <p>拖拽 .bin / .safetensors 至此，或点击选择</p>
                  <button className="btn secondary">浏览文件</button>
                </div>
              </div>
            )}

            {uploadStep === 2 && (
              <div className="wizard-body">
                <label className="form-label">选择算力类型</label>
                <div className="hw-choice-grid">
                  <label className="hw-choice">
                    <input type="radio" name="hw" defaultChecked />
                    <div>
                      <strong>H100 × 8</strong>
                      <p>国际算力 · 高峰性能 · 适合复杂推理</p>
                    </div>
                  </label>
                  <label className="hw-choice">
                    <input type="radio" name="hw" />
                    <div>
                      <strong>昇腾 910C × 16</strong>
                      <p>国产算力 · 合规优先 · 成本低 30%</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {uploadStep === 3 && (
              <div className="wizard-body">
                <div className="success-box">
                  <p className="success-title">✅ 模型部署成功</p>
                  <p>专属 API 端点已自动生成：</p>
                  <code className="mono-text">
                    https://api.tf-private.internal/v1/your-model
                  </code>
                  <p style={{ marginTop: 8 }}>API Key 已生成，请在私有模型管理中查看并妥善保管。</p>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn secondary"
                onClick={() => {
                  if (uploadStep > 1) setUploadStep((s) => s - 1);
                  else setShowUpload(false);
                }}
              >
                {uploadStep > 1 ? "上一步" : "取消"}
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  if (uploadStep < 3) setUploadStep((s) => s + 1);
                  else setShowUpload(false);
                }}
              >
                {uploadStep < 3 ? "下一步" : "完成"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ApiAccessView() {
  const [tab, setTab] = useState<"connect" | "keys" | "playground">("connect");

  // ── connect tab
  const [sdk, setSdk] = useState(apiAccessMock.sdk[0]);

  // ── key management tab
  const [keys, setKeys] = useState(apiAccessMock.keys);
  const [activeKeyId, setActiveKeyId] = useState(apiAccessMock.keys[0].id);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showAudit, setShowAudit] = useState(false);

  // ── playground tab
  const [pgModel, setPgModel] = useState(apiAccessMock.allModels[0]);
  const [streaming, setStreaming] = useState(true);
  const [pgInput, setPgInput] = useState("介绍一下 Token Factory 平台的核心优势");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; tokens?: number; ms?: number; cost?: number }[]>([]);
  const [pgRunning, setPgRunning] = useState(false);

  const activeKey = keys.find((k) => k.id === activeKeyId) ?? keys[0];

  const codeSnippet = useMemo(() => {
    const base = apiAccessMock.baseUrl;
    const key = `${activeKey.prefix}...`;
    if (sdk === "Python") {
      return `from openai import OpenAI

client = OpenAI(
    base_url="${base}",
    api_key="${key}",
)

resp = client.chat.completions.create(
    model="Kimi-K2.5",
    messages=[{"role": "user", "content": "你好"}],
    stream=True,
)
for chunk in resp:
    print(chunk.choices[0].delta.content, end="")`;
    }
    if (sdk === "Java") {
      return `// 兼容 OpenAI Java SDK
var client = OpenAIClient.builder()
    .baseUrl("${base}")
    .apiKey("${key}")
    .build();

var req = ChatCompletionRequest.builder()
    .model("Kimi-K2.5")
    .message(ChatMessage.user("你好"))
    .build();

var resp = client.chatCompletions().create(req);
System.out.println(resp.choices().get(0).message().content());`;
    }
    if (sdk === "cURL") {
      return `curl -X POST "${base}/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${key}" \\
  -d '{
    "model": "Kimi-K2.5",
    "stream": true,
    "messages": [
      {"role": "user", "content": "你好，介绍一下平台"}
    ]
  }'`;
    }
    return `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "${key}",
  baseURL: "${base}",
});

const stream = await client.chat.completions.create({
  model: "Kimi-K2.5",
  stream: true,
  messages: [{ role: "user", content: "你好" }],
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}`;
  }, [sdk, activeKey.prefix]);

  function createKey() {
    if (!newKeyName.trim()) return;
    const next = {
      id: `k-${String(keys.length + 1).padStart(3, "0")}`,
      name: newKeyName.trim(),
      prefix: `tf_new_${Math.random().toString(36).slice(2, 7)}`,
      createdBy: "console-user",
      status: "正常" as ApiKeyStatus,
      expiresAt: "2026-12-31",
      lastUsedAt: "未使用",
      allowedModels: [...apiAccessMock.allModels],
      qpsLimit: 100,
      dailyTokenLimit: 100_000_000,
      ipWhitelist: [] as string[],
    };
    setKeys((prev) => [next, ...prev]);
    setActiveKeyId(next.id);
    setNewKeyName("");
    setShowNewKey(false);
  }

  function toggleKeyModel(model: string) {
    setKeys((prev) =>
      prev.map((k) => {
        if (k.id !== activeKeyId) return k;
        const has = k.allowedModels.includes(model);
        return {
          ...k,
          allowedModels: has
            ? k.allowedModels.filter((m) => m !== model)
            : [...k.allowedModels, model],
        };
      })
    );
  }

  function updateKeyLimit(field: "qpsLimit" | "dailyTokenLimit", val: number) {
    setKeys((prev) =>
      prev.map((k) => (k.id === activeKeyId ? { ...k, [field]: val } : k))
    );
  }

  function disableKey() {
    setKeys((prev) =>
      prev.map((k) =>
        k.id === activeKeyId ? { ...k, status: "已禁用" as ApiKeyStatus } : k
      )
    );
  }

  function sendPlayground() {
    if (!pgInput.trim() || pgRunning) return;
    const userMsg = { role: "user" as const, content: pgInput };
    setMessages((prev) => [...prev, userMsg]);
    setPgInput("");
    setPgRunning(true);
    const delay = 800 + Math.random() * 800;
    const tokens = Math.floor(Math.random() * 600) + 200;
    const cost = (tokens / 1000) * 0.0014;
    setTimeout(() => {
      const reply = {
        role: "assistant" as const,
        content: `[${pgModel}${streaming ? " · 流式" : ""}] Token Factory 是面向企业的异构算力 MaaS 平台，兼容 OpenAI 协议，开发者无需修改业务代码，仅替换域名与密钥即可切换至平台。平台底层融合 H100 与昇腾 910C 算力，智能路由无感路由，Token 单价较行业均价低 30%。`,
        tokens,
        ms: Math.round(delay),
        cost,
      };
      setMessages((prev) => [...prev, reply]);
      setPgRunning(false);
    }, delay);
  }

  return (
    <>
      <header className="hero api-hero">
        <div>
          <p className="eyebrow">Token Factory · API Hub</p>
          <h1>API 接入</h1>
          <p className="subtitle">
            兼容 OpenAI 协议，统一域名接入全部模型，开发者零学习成本完成迁移。
          </p>
        </div>
        <div className="hero-right">
          <button
            className="btn primary"
            onClick={() => {
              setTab("keys");
              setShowNewKey(true);
            }}
          >
            创建 API Key
          </button>
          <button className="btn secondary">下载 OpenAPI 描述</button>
        </div>
      </header>

      {/* KPI Row */}
      <section className="panel">
        <div className="cards four">
          <article className="card spotlight">
            <p>统一接入地址</p>
            <h3 className="smaller">{apiAccessMock.baseUrl}</h3>
            <small>全模型统一网关</small>
          </article>
          <article className="card">
            <p>协议兼容</p>
            <h3>OpenAI</h3>
            <small>直接替换域名 / Key 即可迁移</small>
          </article>
          <article className="card">
            <p>有效密钥</p>
            <h3>{keys.filter((k) => k.status !== "已禁用").length}</h3>
            <small>共 {keys.length} 个密钥</small>
          </article>
          <article className="card">
            <p>接入区域</p>
            <h3>{apiAccessMock.regions.length}</h3>
            <small>{apiAccessMock.regions.join(" · ")}</small>
          </article>
        </div>
      </section>

      {/* Tab Nav */}
      <div className="mc-tab-nav">
        <button className={`mc-tab ${tab === "connect" ? "active" : ""}`} onClick={() => setTab("connect")}>
          统一接入
        </button>
        <button className={`mc-tab ${tab === "keys" ? "active" : ""}`} onClick={() => setTab("keys")}>
          密钥管理
        </button>
        <button className={`mc-tab ${tab === "playground" ? "active" : ""}`} onClick={() => setTab("playground")}>
          在线调试
        </button>
      </div>

      {/* ─── Tab: 统一接入 ─── */}
      {tab === "connect" && (
        <>
          <section className="panel">
            <div className="panel-title-row">
              <h2>接入端点</h2>
              <div className="api-compat-badge">
                <span className="compat-openai">OpenAI 兼容</span>
                <span className="compat-native">原生扩展</span>
              </div>
            </div>
            <div className="table">
              <div className="tr head api-endpoint-grid">
                <span>Method</span>
                <span>Path</span>
                <span>说明</span>
                <span>协议</span>
              </div>
              {apiAccessMock.endpoints.map((ep) => (
                <div className="tr api-endpoint-grid" key={ep.path}>
                  <span>
                    <span className={`method-pill ${ep.method === "GET" ? "method-get" : ""}`}>
                      {ep.method}
                    </span>
                  </span>
                  <span className="mono-text">{ep.path}</span>
                  <span>{ep.desc}</span>
                  <span>
                    <span className={ep.compat === "OpenAI" ? "compat-openai" : "compat-native"}>
                      {ep.compat}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <div className="api-note">
              <strong>🔀 异构算力自动路由</strong> — 调用时无需指定 H100 / 昇腾算力，平台根据负载自动路由，开发者无感。
            </div>
          </section>

          <section className="panel">
            <div className="panel-title-row">
              <h2>多语言调用示例</h2>
              <div className="filters">
                {apiAccessMock.sdk.map((s) => (
                  <button
                    key={s}
                    className={`mc-tab ${sdk === s ? "active" : ""}`}
                    style={{ padding: "6px 14px", fontSize: 13 }}
                    onClick={() => setSdk(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <pre className="code-block api-code-block">{codeSnippet}</pre>
          </section>

          <section className="panel">
            <div className="panel-title-row">
              <h2>错误码手册</h2>
              <span className="muted">常见错误原因与处理建议</span>
            </div>
            <div className="table">
              <div className="tr head api-err-grid">
                <span>HTTP 状态码</span>
                <span>错误名称</span>
                <span>原因说明</span>
              </div>
              {apiAccessMock.errorCodes.map((ec) => (
                <div className="tr api-err-grid" key={ec.code}>
                  <span>
                    <span className={`err-code-badge ${Number(ec.code) >= 500 ? "err-5xx" : Number(ec.code) === 429 ? "err-429" : "err-4xx"}`}>
                      {ec.code}
                    </span>
                  </span>
                  <span className="mono-text">{ec.name}</span>
                  <span className="muted">{ec.desc}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ─── Tab: 密钥管理 ─── */}
      {tab === "keys" && (
        <>
          <section className="panel">
            <div className="panel-title-row">
              <h2>密钥列表</h2>
              <div className="actions-row" style={{ margin: 0 }}>
                <button className="btn secondary" onClick={() => setShowAudit((v) => !v)}>
                  {showAudit ? "关闭审计日志" : "查看调用审计"}
                </button>
                <button className="btn primary" onClick={() => setShowNewKey(true)}>
                  + 创建密钥
                </button>
              </div>
            </div>

            <div className="split-grid">
              {/* Key List */}
              <article className="card list-card">
                <div className="table">
                  <div className="tr head key-grid">
                    <span>密钥名称</span>
                    <span>前缀</span>
                    <span>状态</span>
                    <span>过期时间</span>
                  </div>
                  {keys.map((k) => (
                    <button
                      key={k.id}
                      className={`tr key-grid key-row ${k.id === activeKeyId ? "is-active" : ""}`}
                      type="button"
                      onClick={() => setActiveKeyId(k.id)}
                    >
                      <span>{k.name}</span>
                      <span className="mono-text">{k.prefix}...</span>
                      <span className={`key-status ${k.status}`}>{k.status}</span>
                      <span>{k.expiresAt}</span>
                    </button>
                  ))}
                </div>
              </article>

              {/* Key Detail */}
              <div style={{ display: "grid", gap: 10 }}>
                <article className="card">
                  <div className="panel-title-row" style={{ marginBottom: 12 }}>
                    <strong style={{ fontSize: 15 }}>{activeKey.name}</strong>
                    <div className="actions-row" style={{ margin: 0 }}>
                      <button className="chip" onClick={disableKey}>禁用</button>
                      <button className="chip">轮转</button>
                    </div>
                  </div>

                  <div className="detail-list">
                    <div>
                      <span>密钥前缀</span>
                      <strong className="mono-text">{activeKey.prefix}...</strong>
                    </div>
                    <div>
                      <span>创建人</span>
                      <strong>{activeKey.createdBy}</strong>
                    </div>
                    <div>
                      <span>最近调用</span>
                      <strong>{activeKey.lastUsedAt}</strong>
                    </div>
                  </div>
                </article>

                {/* Granular Permissions */}
                <article className="card">
                  <p style={{ marginBottom: 12 }}>精细化权限</p>

                  <div style={{ marginBottom: 12 }}>
                    <div className="param-label-row">
                      <label className="form-label" style={{ margin: 0 }}>可调用模型</label>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                      {apiAccessMock.allModels.map((m) => (
                        <button
                          key={m}
                          className={`chip ${activeKey.allowedModels.includes(m) ? "chip-active" : "chip-muted"}`}
                          onClick={() => toggleKeyModel(m)}
                        >
                          {activeKey.allowedModels.includes(m) ? "✓ " : ""}{m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="param-item">
                    <div className="param-label-row">
                      <label>QPS 上限</label>
                      <strong>{activeKey.qpsLimit} req/s</strong>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={500}
                      step={10}
                      value={activeKey.qpsLimit}
                      onChange={(e) => updateKeyLimit("qpsLimit", Number(e.target.value))}
                      className="param-slider"
                    />
                    <div className="param-hint"><span>10</span><span>500</span></div>
                  </div>

                  <div className="param-item">
                    <div className="param-label-row">
                      <label>日 Token 限额</label>
                      <strong>{(activeKey.dailyTokenLimit / 1_000_000).toFixed(0)}M Token</strong>
                    </div>
                    <input
                      type="range"
                      min={10_000_000}
                      max={1_000_000_000}
                      step={10_000_000}
                      value={activeKey.dailyTokenLimit}
                      onChange={(e) => updateKeyLimit("dailyTokenLimit", Number(e.target.value))}
                      className="param-slider"
                    />
                    <div className="param-hint"><span>10M</span><span>1,000M</span></div>
                  </div>

                  <div>
                    <div className="param-label-row">
                      <label className="form-label" style={{ margin: 0 }}>IP 白名单</label>
                      <button className="chip">+ 添加</button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                      {activeKey.ipWhitelist.length > 0
                        ? activeKey.ipWhitelist.map((ip) => (
                          <span key={ip} className="ip-chip">{ip}</span>
                        ))
                        : <span className="muted" style={{ fontSize: 13 }}>未设置（不限制来源 IP）</span>
                      }
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* Audit Log */}
          {showAudit && (
            <section className="panel">
              <div className="panel-title-row">
                <h2>调用审计日志</h2>
                <button className="btn ghost">导出 CSV</button>
              </div>
              <div className="table">
                <div className="tr head api-audit-grid">
                  <span>时间</span>
                  <span>密钥</span>
                  <span>模型</span>
                  <span>来源 IP</span>
                  <span>Token</span>
                  <span>延迟</span>
                  <span>状态</span>
                </div>
                {apiAccessMock.auditLogs.map((log, i) => (
                  <div className="tr api-audit-grid" key={i}>
                    <span className="muted">{log.time}</span>
                    <span className="mono-text">{log.key}...</span>
                    <span>{log.model}</span>
                    <span className="mono-text">{log.ip}</span>
                    <span>{log.tokens > 0 ? log.tokens.toLocaleString() : "—"}</span>
                    <span>{log.latency}ms</span>
                    <span>
                      <span className={`err-code-badge ${log.status === 200 ? "err-2xx" : log.status === 429 ? "err-429" : "err-4xx"}`}>
                        {log.status}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ─── Tab: Playground ─── */}
      {tab === "playground" && (
        <section className="panel">
          <div className="panel-title-row">
            <h2>在线调试</h2>
            <div className="pg-controls">
              <select
                value={pgModel}
                onChange={(e) => setPgModel(e.target.value)}
                className="config-select"
              >
                {apiAccessMock.allModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <label className="toggle-switch" title={streaming ? "流式输出" : "非流式"}>
                <input
                  type="checkbox"
                  checked={streaming}
                  onChange={(e) => setStreaming(e.target.checked)}
                />
                <span className="toggle-track" />
              </label>
              <span className="muted" style={{ fontSize: 13 }}>
                {streaming ? "流式输出" : "非流式"}
              </span>
              <button
                className="btn ghost"
                style={{ padding: "6px 12px", fontSize: 13 }}
                onClick={() => setMessages([])}
              >
                清空会话
              </button>
            </div>
          </div>

          {/* Message Thread */}
          <div className="pg-thread">
            {messages.length === 0 && (
              <div className="pg-empty">
                <p>选择模型，输入 Prompt，开始调试</p>
                <div className="pg-hints">
                  {["介绍一下平台核心优势", "帮我写一段 Python 接入代码", "Token 计费规则是什么"].map((hint) => (
                    <button key={hint} className="chip" onClick={() => setPgInput(hint)}>
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`pg-msg pg-msg-${msg.role}`}>
                <div className="pg-bubble">{msg.content}</div>
                {msg.role === "assistant" && msg.tokens !== undefined && (
                  <div className="pg-stats">
                    <span>🔢 {msg.tokens} tokens</span>
                    <span>⏱ {msg.ms}ms</span>
                    <span>💰 ¥{msg.cost!.toFixed(5)}</span>
                  </div>
                )}
              </div>
            ))}
            {pgRunning && (
              <div className="pg-msg pg-msg-assistant">
                <div className="pg-bubble pg-typing">▋ 正在生成...</div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="pg-input-row">
            <textarea
              className="pg-textarea"
              value={pgInput}
              onChange={(e) => setPgInput(e.target.value)}
              placeholder="输入 Prompt，按 Ctrl+Enter 发送"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault();
                  sendPlayground();
                }
              }}
            />
            <button
              className="btn primary pg-send-btn"
              onClick={sendPlayground}
              disabled={pgRunning}
            >
              {pgRunning ? "生成中..." : "▶ 发送"}
            </button>
          </div>
        </section>
      )}

      {/* New Key Modal */}
      {showNewKey && (
        <div
          className="modal-mask"
          role="presentation"
          onClick={() => setShowNewKey(false)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>创建 API Key</h3>
            <label className="form-label">密钥名称</label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="例: prod-gateway-v2"
              style={{ width: "100%", border: "1px solid #cad8d0", borderRadius: 10, padding: "9px 12px", fontSize: 14 }}
            />
            <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
              创建后可在密钥详情中配置可用模型、QPS 限制与 IP 白名单。
            </p>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowNewKey(false)}>取消</button>
              <button className="btn primary" onClick={createKey}>确认创建</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function UsageMonitorView() {
  const [window, setWindow] = useState<"24h" | "7d">("24h");
  const [modelFilter, setModelFilter] = useState("全部模型");

  const filteredModels = useMemo(() => {
    if (modelFilter === "全部模型") {
      return usageMonitorMock.models;
    }
    return usageMonitorMock.models.filter((item) => item.name === modelFilter);
  }, [modelFilter]);

  return (
    <>
      <header className="hero usage-hero">
        <div>
          <p className="eyebrow">Token Factory · Usage Analytics</p>
          <h1>用量监控</h1>
          <p className="subtitle">实时追踪调用量、延迟、错误率与团队配额使用，帮助平台及时发现风险并优化资源策略。</p>
        </div>
        <div className="hero-right">
          <div className="filters compact">
            <select value={window} onChange={(e) => setWindow(e.target.value as "24h" | "7d")} aria-label="时间窗口">
              <option value="24h">近 24 小时</option>
              <option value="7d">近 7 天</option>
            </select>
            <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)} aria-label="模型筛选">
              <option value="全部模型">全部模型</option>
              {usageMonitorMock.models.map((item) => (
                <option key={item.name} value={item.name}>{item.name}</option>
              ))}
            </select>
          </div>
          <button className="btn secondary">导出监控报表</button>
        </div>
      </header>

      <section className="panel">
        <div className="panel-title-row">
          <h2>实时健康度</h2>
          <span className="muted">{window === "24h" ? "分钟级刷新" : "小时级聚合"} · 更新时间 {new Date().toLocaleTimeString("zh-CN")}</span>
        </div>
        <div className="cards four">
          <article className="card spotlight">
            <p>实时 QPS</p>
            <h3>{usageMonitorMock.kpis.rtQps}</h3>
            <TrendLine values={usageMonitorMock.byHour.qps} color="#2089d5" />
          </article>
          <article className="card">
            <p>p95 延迟</p>
            <h3>{usageMonitorMock.kpis.p95Latency}ms</h3>
            <TrendLine values={usageMonitorMock.byHour.latency} color="#8056d8" />
          </article>
          <article className="card">
            <p>成功率</p>
            <h3>{usageMonitorMock.kpis.successRate}%</h3>
            <small>错误率越低越稳定</small>
          </article>
          <article className="card danger">
            <p>错误率</p>
            <h3>{usageMonitorMock.kpis.errorRate}%</h3>
            <TrendLine values={usageMonitorMock.byHour.errors} color="#b42318" />
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title-row">
          <h2>Token 与调用分析</h2>
          <span className="muted">按模型维度查看吞吐与质量</span>
        </div>
        <div className="cards two">
          <article className="card">
            <p>今日 Token 总消耗</p>
            <h3>{integer(usageMonitorMock.kpis.todayTokens)}</h3>
            <small>昨日: {integer(usageMonitorMock.kpis.yesterdayTokens)}</small>
          </article>
          <article className="card">
            <p>近时段 QPS 趋势</p>
            <TrendLine values={usageMonitorMock.byHour.qps} color="#1e6bd6" />
            <small>峰值出现在 10:00-11:00</small>
          </article>
        </div>

        <article className="card">
          <p>模型调用表现</p>
          <div className="table">
            <div className="tr head usage-model-grid">
              <span>模型</span>
              <span>调用次数</span>
              <span>Token 消耗</span>
              <span>平均 QPS</span>
              <span>错误率</span>
            </div>
            {filteredModels.map((item) => (
              <div className="tr usage-model-grid" key={item.name}>
                <span>{item.name}</span>
                <span>{integer(item.calls)}</span>
                <span>{integer(item.tokens)}</span>
                <span>{item.qps}</span>
                <span className={item.err > 0.8 ? "text-danger" : ""}>{item.err}%</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-title-row">
          <h2>团队用量与预算</h2>
          <span className="muted">预算消耗超过 80% 可触发自动预警</span>
        </div>
        <div className="split-grid">
          <article className="card">
            <p>团队调用占比</p>
            <div className="table">
              <div className="tr head team-grid">
                <span>团队</span>
                <span>调用次数</span>
                <span>占比</span>
              </div>
              {usageMonitorMock.teams.map((item) => (
                <div className="tr team-grid" key={item.team}>
                  <span>{item.team}</span>
                  <span>{integer(item.calls)}</span>
                  <span>{item.share}%</span>
                </div>
              ))}
            </div>
          </article>

          <article className="card">
            <p>团队预算使用率</p>
            <div className="budget-list">
              {usageMonitorMock.teams.map((item) => (
                <div className="budget-row" key={item.team}>
                  <div>
                    <strong>{item.team}</strong>
                    <small>{item.budgetUsed}%</small>
                  </div>
                  <div className="bar"><span style={{ width: `${item.budgetUsed}%` }} /></div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className="card">
          <p>异常告警</p>
          <ul className="todo-list">
            {usageMonitorMock.alerts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}


function BillingCenterView() {
  const [tab, setTab] = useState<"overview" | "detail" | "recharge" | "finance">("overview");
  const [selectedMonth, setSelectedMonth] = useState(billingMock.months[0]);
  const [detailView, setDetailView] = useState<"day" | "model" | "key">("day");
  const [alertThreshold, setAlertThreshold] = useState(85);
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(10000);
  const [showFapiaoForm, setShowFapiaoForm] = useState(false);

  const monthInvoices = useMemo(
    () => billingMock.invoices.filter((item) => item.month === selectedMonth),
    [selectedMonth]
  );
  const budgetUsed = Math.round((billingMock.currentSpend / billingMock.budget) * 100);
  const remain = billingMock.budget - billingMock.currentSpend;
  const maxDaily = Math.max(...billingMock.dailySpend.map((d) => d.amount));

  return (
    <>
      <header className="hero billing-hero">
        <div>
          <p className="eyebrow">Token Factory · Billing Intelligence</p>
          <h1>计费中心</h1>
          <p className="subtitle">透明账单、灵活充值、多模式计费，助力企业精准控成本、高效对账。</p>
        </div>
        <div className="hero-right">
          <button className="btn primary" onClick={() => setShowRecharge(true)}>快速充值</button>
          <button className="btn secondary">导出账单明细</button>
        </div>
      </header>

      <section className="panel">
        <div className="cards three">
          <article className="card spotlight">
            <p>账户余额</p>
            <h3>{currency(billingMock.balance)}</h3>
            <small>可用余额</small>
          </article>
          <article className="card">
            <p>当月已消费</p>
            <h3>{currency(billingMock.currentSpend)}</h3>
            <small>预算 {currency(billingMock.budget)} · 已用 {budgetUsed}%</small>
          </article>
          <article className="card">
            <p>预估月末账单</p>
            <h3>{currency(billingMock.forecast)}</h3>
            <TrendLine values={billingMock.trend} color="#2f7cc0" />
          </article>
          {/* <article className="card danger">
            <p>待回款金额</p>
            <h3>{currency(billingMock.unpaidAmount)}</h3>
            <small>已结清 {billingMock.paidInvoices} 张</small>
          </article> */}
        </div>
        <div style={{ marginTop: 14 }}>
          <div className="panel-title-row" style={{ marginBottom: 6 }}>
            <span className="muted">预算执行进度</span>
            <span className="muted">{currency(billingMock.currentSpend)} / {currency(billingMock.budget)}</span>
          </div>
          <div className="bar" style={{ height: 12 }}>
            <span style={{ width: `${budgetUsed}%`, background: budgetUsed > alertThreshold ? "linear-gradient(90deg,#e05c5c,#b42318)" : undefined }} />
          </div>
          {budgetUsed > alertThreshold && (
            <p className="muted" style={{ fontSize: 12, marginTop: 4, color: "#b42318" }}>
              ⚠ 预算使用率 {budgetUsed}% 已超过预警阈值 {alertThreshold}%
            </p>
          )}
        </div>
      </section>

      <div className="mc-tab-nav">
        <button className={`mc-tab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>账单总览</button>
        <button className={`mc-tab ${tab === "detail" ? "active" : ""}`} onClick={() => setTab("detail")}>明细对账</button>
        <button className={`mc-tab ${tab === "recharge" ? "active" : ""}`} onClick={() => setTab("recharge")}>充值套餐</button>
        <button className={`mc-tab ${tab === "finance" ? "active" : ""}`} onClick={() => setTab("finance")}>财务辅助</button>
      </div>

      {tab === "overview" && (
        <>
          <section className="panel">
            <div className="panel-title-row">
              <h2>计费模式</h2>
              <span className="advantage-tag">异构算力加持 · 比 AWS Bedrock 低 30%−50%</span>
            </div>
            <div className="cards four" style={{ marginTop: 12 }}>
              {billingMock.billingModes.map((mode) => (
                <article className="card billing-mode-card" key={mode.key}>
                  <div className="billing-mode-header">
                    <strong>{mode.name}</strong>
                    {mode.badge && <span className="billing-mode-badge">{mode.badge}</span>}
                  </div>
                  <p className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{mode.desc}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-title-row">
              <h2>模型价格表</h2>
              <span className="muted">所有价格含 VAT，按实际消耗结算</span>
            </div>
            <div className="table">
              <div className="tr head billing-price-grid">
                <span>模型</span>
                <span>输入 Token / 1K</span>
                <span>输出 Token / 1K</span>
                <span>会话单价</span>
                <span>比 AWS Bedrock</span>
              </div>
              {billingMock.modelPricing.map((row) => (
                <div className="tr billing-price-grid" key={row.model}>
                  <span>{row.model}</span>
                  <span>¥{row.inputPer1k.toFixed(4)}</span>
                  <span>¥{row.outputPer1k.toFixed(4)}</span>
                  <span>¥{row.sessionPrice.toFixed(4)}</span>
                  <span><span className="savings-badge">↓低{row.awsSavings}%</span></span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-title-row">
              <h2>本月费用结构</h2>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="config-select">
                {billingMock.months.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="split-grid">
              <article className="card">
                <p>按计费科目拆分</p>
                <div className="cost-list" style={{ marginTop: 10 }}>
                  {billingMock.compositions.map((item) => (
                    <div className="cost-row" key={item.name}>
                      <div>
                        <strong>{item.name}</strong>
                        <small>{currency(item.value)} · {item.percent}%</small>
                      </div>
                      <div className="bar"><span style={{ width: `${item.percent}%` }} /></div>
                    </div>
                  ))}
                </div>
              </article>
              <article className="card">
                <p>预算预警策略</p>
                <h3 style={{ marginTop: 8 }}>{alertThreshold}%</h3>
                <small>超过阈值时自动通知财务与管理员</small>
                <div className="budget-settings">
                  <label htmlFor="alert-threshold">预警阈值（当前：{alertThreshold}%）</label>
                  <input id="alert-threshold" type="range" min={50} max={100} value={alertThreshold}
                    onChange={(e) => setAlertThreshold(Number(e.target.value))} />
                  <div className="quick-grid">
                    <button className="btn primary">保存策略</button>
                    <button className="btn secondary">发送测试提醒</button>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section className="panel">
            <div className="panel-title-row">
              <h2>历史账单</h2>
              <div className="actions-row" style={{ margin: 0 }}>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="config-select">
                  {billingMock.months.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <button className="btn ghost">导出 Excel</button>
                <button className="btn ghost">导出 PDF</button>
              </div>
            </div>
            <div className="table">
              <div className="tr head invoice-grid-ext">
                <span>账单号</span>
                <span>团队</span>
                <span>金额</span>
                <span>到期日</span>
                <span>状态</span>
                <span>操作</span>
              </div>
              {monthInvoices.map((item) => (
                <div className="tr invoice-grid-ext" key={item.id}>
                  <span className="mono-text">{item.id}</span>
                  <span>{item.team}</span>
                  <span><strong>{currency(item.amount)}</strong></span>
                  <span>{item.dueDate}</span>
                  <span className={`invoice-status ${item.status}`}>{item.status}</span>
                  <span>
                    <button className="chip">查看明细</button>
                    {item.status === "待支付" && <button className="chip" style={{ marginLeft: 4 }}>立即支付</button>}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {tab === "detail" && (
        <>
          <section className="panel">
            <div className="panel-title-row">
              <h2>消费明细对账</h2>
              <div className="actions-row" style={{ margin: 0 }}>
                <div className="mc-tab-nav" style={{ padding: "3px" }}>
                  {(["day", "model", "key"] as const).map((v) => (
                    <button key={v} className={`mc-tab ${detailView === v ? "active" : ""}`}
                      style={{ padding: "6px 14px", fontSize: 13 }} onClick={() => setDetailView(v)}>
                      {v === "day" ? "按天" : v === "model" ? "按模型" : "按 API Key"}
                    </button>
                  ))}
                </div>
                <button className="btn ghost">导出 Excel</button>
              </div>
            </div>

            {detailView === "day" && (
              <div className="daily-chart">
                {billingMock.dailySpend.map((d) => (
                  <div key={d.date} className="daily-bar-col">
                    <span className="daily-bar-value">{(d.amount / 1000).toFixed(1)}k</span>
                    <div className="daily-bar-wrap">
                      <div className="daily-bar-fill" style={{ height: `${Math.round((d.amount / maxDaily) * 100)}%` }} />
                    </div>
                    <span className="daily-bar-label">{d.date}</span>
                  </div>
                ))}
              </div>
            )}

            {detailView === "model" && (
              <div className="table">
                <div className="tr head billing-detail-grid">
                  <span>模型</span><span>费用</span><span>Token 消耗</span><span>调用次数</span><span>占比</span>
                </div>
                {billingMock.byModel.map((row) => {
                  const pct = Math.round((row.amount / billingMock.currentSpend) * 100);
                  return (
                    <div className="tr billing-detail-grid" key={row.model}>
                      <span>{row.model}</span>
                      <span><strong>{currency(row.amount)}</strong></span>
                      <span>{(row.tokens / 1_000_000).toFixed(1)}M</span>
                      <span>{row.calls.toLocaleString()}</span>
                      <span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div className="bar" style={{ width: 80, height: 6 }}><span style={{ width: `${pct}%` }} /></div>
                          <span className="muted">{pct}%</span>
                        </div>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {detailView === "key" && (
              <div className="table">
                <div className="tr head billing-key-grid">
                  <span>密钥名称</span><span>前缀</span><span>费用</span><span>调用次数</span><span>占比</span>
                </div>
                {billingMock.byKey.map((row) => {
                  const pct = Math.round((row.amount / billingMock.currentSpend) * 100);
                  return (
                    <div className="tr billing-key-grid" key={row.key}>
                      <span>{row.name}</span>
                      <span className="mono-text">{row.key}...</span>
                      <span><strong>{currency(row.amount)}</strong></span>
                      <span>{row.calls.toLocaleString()}</span>
                      <span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div className="bar" style={{ width: 80, height: 6 }}><span style={{ width: `${pct}%` }} /></div>
                          <span className="muted">{pct}%</span>
                        </div>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-title-row"><h2>预算余量</h2><span className="muted">{currency(remain)} 可用</span></div>
            <div className="cards three">
              <article className="card spotlight"><p>总预算</p><h3>{currency(billingMock.budget)}</h3></article>
              <article className="card"><p>已消费</p><h3>{currency(billingMock.currentSpend)}</h3><small>{budgetUsed}%</small></article>
              <article className="card"><p>剩余可用</p><h3>{currency(remain)}</h3><small>预计月末消耗 {currency(billingMock.forecast)}</small></article>
            </div>
          </section>
        </>
      )}

      {tab === "recharge" && (
        <>
          <section className="panel">
            <div className="panel-title-row">
              <h2>套餐购买</h2>
              <span className="advantage-tag">企业套餐比按量节省 15%−30%</span>
            </div>
            <div className="cards two" style={{ marginTop: 12 }}>
              {billingMock.packages.map((pkg) => (
                <article key={pkg.id} className={`card billing-pkg-card ${pkg.popular ? "pkg-popular" : ""}`}>
                  {pkg.popular && <div className="pkg-popular-badge">最受欢迎</div>}
                  <div className="billing-mode-header">
                    <strong style={{ fontSize: 16 }}>{pkg.name}</strong>
                    <span className={`hw-tag ${pkg.type === "instance" ? "hw-h100" : "feature-tag"}`}>
                      {pkg.type === "instance" ? "独享实例" : "Token 包"}
                    </span>
                  </div>
                  <p className="muted" style={{ fontSize: 13, margin: "8px 0" }}>{pkg.desc}</p>
                  <div className="pkg-price-row">
                    <strong className="pkg-price">¥{pkg.price.toLocaleString()}</strong>
                    <span className="muted">Token 量: {pkg.tokens}</span>
                  </div>
                  <button className="btn primary" style={{ marginTop: 10, width: "100%" }}>一键购买</button>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-title-row"><h2>合约管理</h2><button className="btn ghost">联系商务续约</button></div>
            <div className="table">
              <div className="tr head billing-contract-grid">
                <span>合约编号</span><span>合约名称</span><span>类型</span><span>折扣</span><span>有效期</span><span>状态</span>
              </div>
              {billingMock.contracts.map((c) => (
                <div className="tr billing-contract-grid" key={c.id}>
                  <span className="mono-text">{c.id}</span>
                  <span>{c.name}</span>
                  <span>{c.type}</span>
                  <span><span className="savings-badge">{c.discount}</span></span>
                  <span className="muted">{c.startDate} ~ {c.endDate}</span>
                  <span>
                    <span className={`invoice-status ${c.status === "生效中" ? "已支付" : "逾期风险"}`}>{c.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {tab === "finance" && (
        <>
          <section className="panel">
            <div className="panel-title-row">
              <h2>发票管理</h2>
              <button className="btn primary" onClick={() => setShowFapiaoForm(true)}>申请开票</button>
            </div>
            <div className="table">
              <div className="tr head billing-fp-grid">
                <span>发票号</span><span>账期</span><span>金额</span><span>类型</span><span>状态</span><span>操作</span>
              </div>
              {billingMock.fapiao.map((fp) => (
                <div className="tr billing-fp-grid" key={fp.id}>
                  <span className="mono-text">{fp.id}</span>
                  <span>{fp.month}</span>
                  <span><strong>{currency(fp.amount)}</strong></span>
                  <span className="muted">{fp.type}</span>
                  <span className={`invoice-status ${fp.status === "已开票" ? "已支付" : "待支付"}`}>{fp.status}</span>
                  <span>{fp.downloadable && <button className="chip">下载 PDF</button>}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-title-row"><h2>退款申请</h2><button className="btn ghost">提交退款申请</button></div>
            <div className="table">
              <div className="tr head billing-refund-grid">
                <span>退款单号</span><span>退款原因</span><span>金额</span><span>申请日期</span><span>状态</span>
              </div>
              {billingMock.refunds.map((r) => (
                <div className="tr billing-refund-grid" key={r.id}>
                  <span className="mono-text">{r.id}</span>
                  <span>{r.reason}</span>
                  <span><strong>{currency(r.amount)}</strong></span>
                  <span>{r.applyDate}</span>
                  <span>
                    <span className={`invoice-status ${r.status === "已到账" ? "已支付" : "待支付"}`}>{r.status}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="api-note" style={{ marginTop: 14 }}>
              <strong>💡 退款说明</strong> — 服务中断赔付和合规退款通常 3−5 个工作日到账，节假日顺延。
            </div>
          </section>

          <section className="panel">
            <div className="panel-title-row"><h2>费用明细导出</h2><span className="muted">适配企业财务做账与审计需求</span></div>
            <div className="cards three">
              {[
                { label: "当月消费明细", desc: "按天 / 模型 / Key 拆分", format: "Excel" },
                { label: "历史账单归档", desc: "180 天留存，随时检索", format: "PDF" },
                { label: "VAT 发票汇总", desc: "增值税发票批量下载", format: "ZIP" },
              ].map((item) => (
                <article className="card" key={item.label}>
                  <p>{item.label}</p>
                  <p className="muted" style={{ fontSize: 13, margin: "6px 0" }}>{item.desc}</p>
                  <button className="btn secondary">导出 {item.format}</button>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {showRecharge && (
        <div className="modal-mask" role="presentation" onClick={() => setShowRecharge(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>快速充值</h3>
            <p className="muted" style={{ fontSize: 13 }}>充值后实时到账，支持对公转账和企业信用卡。</p>
            <div className="recharge-presets">
              {[5000, 10000, 30000, 50000].map((v) => (
                <button key={v} className={`chip ${rechargeAmount === v ? "chip-active" : ""}`}
                  onClick={() => setRechargeAmount(v)}>
                  ¥{v.toLocaleString()}
                </button>
              ))}
            </div>
            <label className="form-label" style={{ marginTop: 12 }}>自定义金额（CNY）</label>
            <input type="number" value={rechargeAmount} min={100}
              onChange={(e) => setRechargeAmount(Number(e.target.value))}
              style={{ width: "100%", border: "1px solid #cad8d0", borderRadius: 10, padding: "9px 12px", fontSize: 14 }} />
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowRecharge(false)}>取消</button>
              <button className="btn primary" onClick={() => setShowRecharge(false)}>确认充值 {currency(rechargeAmount)}</button>
            </div>
          </div>
        </div>
      )}

      {showFapiaoForm && (
        <div className="modal-mask" role="presentation" onClick={() => setShowFapiaoForm(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>申请开票</h3>
            <label className="form-label">开票账期</label>
            <select className="config-select" style={{ width: "100%" }}>
              {billingMock.months.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <label className="form-label" style={{ marginTop: 12 }}>发票类型</label>
            <div className="hw-choice-grid">
              <label className="hw-choice">
                <input type="radio" name="fp-type" defaultChecked />
                <div><strong>增值税专用发票</strong><p>适合企业进项抵扣</p></div>
              </label>
              <label className="hw-choice">
                <input type="radio" name="fp-type" />
                <div><strong>增值税普通发票</strong><p>适合日常报销</p></div>
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowFapiaoForm(false)}>取消</button>
              <button className="btn primary" onClick={() => setShowFapiaoForm(false)}>提交申请</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
function TeamAuthView() {
  const [members, setMembers] = useState(teamAuthMock.members);
  const [roleFilter, setRoleFilter] = useState("全部角色");
  const [activeMemberId, setActiveMemberId] = useState(teamAuthMock.members[0].id);

  const filteredMembers = useMemo(() => {
    if (roleFilter === "全部角色") {
      return members;
    }
    return members.filter((item) => item.role === roleFilter);
  }, [members, roleFilter]);

  const activeMember =
    filteredMembers.find((item) => item.id === activeMemberId) ?? filteredMembers[0] ?? members[0];

  function updateMemberFlag(flag: "canBilling" | "canManageKeys", value: boolean) {
    setMembers((prev) =>
      prev.map((item) => (item.id === activeMember.id ? { ...item, [flag]: value } : item))
    );
  }

  return (
    <>
      <header className="hero team-hero">
        <div>
          <p className="eyebrow">Token Factory · Team & Access</p>
          <h1>团队权限</h1>
          <p className="subtitle">围绕成员、角色、模型与密钥范围进行统一权限治理，保障企业级多团队安全协作。</p>
        </div>
        <div className="hero-right">
          <button className="btn primary">邀请成员</button>
          <button className="btn secondary">新建角色模板</button>
        </div>
      </header>

      <section className="panel">
        <div className="panel-title-row">
          <h2>权限资产概览</h2>
          <span className="muted">成员规模与授权边界全局可视</span>
        </div>
        <div className="cards four">
          <article className="card spotlight">
            <p>成员数</p>
            <h3>{teamAuthMock.summary.members}</h3>
            <small>覆盖多团队协作</small>
          </article>
          <article className="card">
            <p>角色模板</p>
            <h3>{teamAuthMock.summary.roles}</h3>
            <small>RBAC 预设角色</small>
          </article>
          <article className="card">
            <p>绑定 API Key</p>
            <h3>{teamAuthMock.summary.apiKeysBound}</h3>
            <small>按成员范围控制</small>
          </article>
          <article className="card">
            <p>模型授权范围</p>
            <h3>{teamAuthMock.summary.modelsScoped}</h3>
            <small>最小权限原则</small>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title-row">
          <h2>角色矩阵</h2>
          <span className="muted">各角色权限清晰可见，减少越权风险</span>
        </div>
        <div className="cards three">
          {teamAuthMock.roles.map((role) => (
            <article className="card" key={role.name}>
              <p>{role.name}</p>
              <h3>{role.users}</h3>
              <small>成员数</small>
              <div className="quick-grid">
                {role.permissions.map((p) => (
                  <span className="chip" key={p}>{p}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title-row">
          <h2>成员与资源授权</h2>
          <div className="filters">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="角色筛选">
              <option value="全部角色">全部角色</option>
              {teamAuthMock.roles.map((item) => (
                <option key={item.name} value={item.name}>{item.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="split-grid">
          <article className="card list-card">
            <div className="table">
              <div className="tr head member-grid">
                <span>成员</span>
                <span>团队</span>
                <span>角色</span>
                <span>状态</span>
                <span>最近登录</span>
              </div>
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  className={`tr member-grid member-row ${member.id === activeMember.id ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setActiveMemberId(member.id)}
                >
                  <span>
                    <strong>{member.name}</strong>
                    <small>{member.email}</small>
                  </span>
                  <span>{member.team}</span>
                  <span>{member.role}</span>
                  <span className={`member-status ${member.status}`}>{member.status}</span>
                  <span>{member.lastLogin}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="card">
            <p>授权详情</p>
            <h3>{activeMember.name}</h3>
            <div className="detail-list">
              <div>
                <span>邮箱</span>
                <strong>{activeMember.email}</strong>
              </div>
              <div>
                <span>模型权限</span>
                <strong>{activeMember.modelScopes.join(" / ")}</strong>
              </div>
              <div>
                <span>密钥范围</span>
                <strong>{activeMember.keyScopes.join(" / ")}</strong>
              </div>
              <div>
                <span>计费权限</span>
                <strong>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={activeMember.canBilling}
                      onChange={(e) => updateMemberFlag("canBilling", e.target.checked)} />
                    <span className="toggle-track" />
                  </label>
                </strong>
              </div>
              <div>
                <span>密钥管理权限</span>
                <strong>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={activeMember.canManageKeys}
                      onChange={(e) => updateMemberFlag("canManageKeys", e.target.checked)} />
                    <span className="toggle-track" />
                  </label>
                </strong>
              </div>
            </div>
            <div className="quick-grid" style={{ marginTop: 14 }}>
              <button className="btn primary">保存权限</button>
              <button className="btn ghost">重置为角色默认</button>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}

function SystemSettingsView() {
  const [regions, setRegions] = useState(systemMock.regions);

  function toggleRegion(name: string) {
    setRegions((prev) =>
      prev.map((r) => (r.name === name ? { ...r, enabled: !r.enabled } : r))
    );
  }

  return (
    <>
      <header className="hero system-hero">
        <div>
          <p className="eyebrow">Token Factory · System</p>
          <h1>系统设置</h1>
          <p className="subtitle">管理算力区域调度、Webhook 通知、审计留痕与全局配置，保障平台高可用与合规运营。</p>
        </div>
        {/* <div className="hero-right">
          <button className="btn secondary">导出配置</button>
        </div> */}
      </header>

      <section className="panel">
        <div className="panel-title-row">
          <h2>Webhook 通知</h2>
          <button className="btn ghost">添加 Webhook</button>
        </div>
        <div className="table">
          <div className="tr head webhook-grid">
            <span>名称</span>
            <span>目标 URL</span>
            <span>状态</span>
            <span>操作</span>
          </div>
          {systemMock.webhooks.map((wh) => (
            <div className="tr webhook-grid" key={wh.name}>
              <span>{wh.name}</span>
              <span className="mono-text">{wh.url}</span>
              <span className={`member-status ${wh.enabled ? "正常" : "冻结"}`}>{wh.enabled ? "已启用" : "已停用"}</span>
              <span><button className="chip">编辑</button></span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title-row">
          <h2>区域与故障转移</h2>
          <span className="muted">管理算力区域是否启用与容量配额</span>
        </div>
        <article className="card list-card">
          <div className="table">
            <div className="tr head region-grid">
              <span>区域</span>
              <span>启用状态</span>
              <span>QPS 配额</span>
              <span>故障转移</span>
            </div>
            {regions.map((item) => (
              <button key={item.name} type="button" className="tr region-grid setting-row" onClick={() => toggleRegion(item.name)}>
                <span>{item.name}</span>
                <span className={item.enabled ? "member-status 正常" : "member-status 冻结"}>{item.enabled ? "已启用" : "已停用"}</span>
                <span>{item.quota}</span>
                <span>{item.failover ? "已开启" : "关闭"}</span>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-title-row">
          <h2>审计日志</h2>
          <span className="muted">关键配置变更全量留痕</span>
        </div>
        <article className="card">
          <ul className="todo-list">
            {systemMock.auditLogs.map((log) => (
              <li key={log}>{log}</li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="badge">TF</span>
          <div>
            <strong>Token Factory</strong>
            <small>企业级模型推理 MaaS</small>
          </div>
        </div>
        <nav className="nav-list" aria-label="控制台菜单">
          {modules.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`nav-item ${activeModule === item.key ? "active" : ""}`}
              onClick={() => setActiveModule(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="page">
        {activeModule === "dashboard" ? <DashboardView /> : null}
        {activeModule === "model-center" ? <ModelCenterView /> : null}
        {activeModule === "api-access" ? <ApiAccessView /> : null}
        {activeModule === "usage-monitor" ? <UsageMonitorView /> : null}
        {activeModule === "billing" ? <BillingCenterView /> : null}
        {activeModule === "team-auth" ? <TeamAuthView /> : null}
        {activeModule === "system" ? <SystemSettingsView /> : null}
      </main>
    </div>
  );
}

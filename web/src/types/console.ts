export type TrendLineProps = {
  values: number[];
  color: string;
};

export type ModuleKey =
  | "dashboard"
  | "model-center"
  | "api-access"
  | "usage-monitor"
  | "billing"
  | "team-auth"
  | "system";

export type ModelStatus = "全部" | "在线" | "灰度" | "离线";

export type ApiKeyStatus = "正常" | "即将过期" | "已禁用";

export type InvoiceStatus = "已支付" | "待支付" | "逾期风险";

export type MemberStatus = "正常" | "待激活" | "冻结";

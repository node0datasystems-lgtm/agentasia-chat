'use client';

import { formatPrice, formatShortenNumber, formatTime } from '@lobechat/utils/format';
import { Center, Empty, Flexbox, Icon, Skeleton, Tag, Text, Tooltip } from '@lobehub/ui';
import { createStaticStyles, cssVar } from 'antd-style';
import {
  Activity,
  Bot,
  CircleDollarSign,
  Clock3,
  ListChecks,
  type LucideIcon,
  Zap,
} from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { lambdaQuery } from '@/libs/trpc/client';
import { useAgentStore } from '@/store/agent';

const STATUS_COLOR: Record<string, string> = {
  done: 'success',
  error: 'error',
  interrupted: 'warning',
  running: 'processing',
  waiting_for_async_tool: 'processing',
  waiting_for_human: 'warning',
};

const styles = createStaticStyles(({ css }) => ({
  bar: css`
    overflow: hidden;
    display: flex;
    flex-direction: column-reverse;

    width: 100%;
    min-width: 12px;
    border-radius: 5px 5px 2px 2px;

    background: ${cssVar.colorFillQuaternary};
  `,
  barInput: css`
    background: ${cssVar.colorPrimary};
  `,
  barOutput: css`
    background: ${cssVar.colorInfo};
  `,
  card: css`
    padding: 16px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};
    background: ${cssVar.colorBgContainer};
  `,
  chart: css`
    display: grid;
    gap: 8px;
    align-items: end;

    height: 180px;
    padding-block: 8px 4px;
    border-block-end: 1px solid ${cssVar.colorBorderSecondary};
  `,
  chartColumn: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;

    min-width: 0;
    height: 100%;
  `,
  chartLabel: css`
    overflow: hidden;

    width: 100%;

    font-size: 10px;
    line-height: 1;
    color: ${cssVar.colorTextQuaternary};
    text-align: center;
    text-overflow: clip;
    white-space: nowrap;
  `,
  chartLegend: css`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;

    font-size: 12px;
    color: ${cssVar.colorTextSecondary};
  `,
  chartWrap: css`
    overflow-x: auto;
  `,
  emptyCard: css`
    min-height: 260px;
  `,
  legendDotInput: css`
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${cssVar.colorPrimary};
  `,
  legendDotOutput: css`
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${cssVar.colorInfo};
  `,
  recentHeader: css`
    display: grid;
    grid-template-columns: minmax(120px, 1.2fr) minmax(100px, 1fr) 90px 90px 90px;
    gap: 12px;

    padding-block: 0 8px;
    border-block-end: 1px solid ${cssVar.colorBorderSecondary};

    font-size: 11px;
    color: ${cssVar.colorTextTertiary};
    text-transform: uppercase;
    letter-spacing: 0.04em;
  `,
  recentRow: css`
    display: grid;
    grid-template-columns: minmax(120px, 1.2fr) minmax(100px, 1fr) 90px 90px 90px;
    gap: 12px;
    align-items: center;

    min-height: 44px;
    padding-block: 8px;

    & + & {
      border-block-start: 1px solid ${cssVar.colorBorderSecondary};
    }
  `,
  statCard: css`
    flex: 1;

    min-width: 160px;
    padding: 14px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};

    background: ${cssVar.colorBgContainer};
  `,
  statIcon: css`
    color: ${cssVar.colorTextTertiary};
  `,
  statLabel: css`
    font-size: 11px;
    color: ${cssVar.colorTextTertiary};
    text-transform: uppercase;
    letter-spacing: 0.04em;
  `,
  statSub: css`
    overflow: hidden;

    min-height: 18px;

    font-size: 12px;
    color: ${cssVar.colorTextSecondary};
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  statValue: css`
    font-size: 28px;
    font-feature-settings: 'tnum';
    font-weight: 700;
    line-height: 1.1;
    color: ${cssVar.colorText};
  `,
  title: css`
    font-size: 15px;
    font-weight: 600;
  `,
}));

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  sub?: string;
  value: string;
}

const StatCard = memo<StatCardProps>(({ icon, label, sub, value }) => (
  <div className={styles.statCard}>
    <Flexbox gap={10}>
      <Flexbox horizontal align="center" gap={8}>
        <Icon className={styles.statIcon} icon={icon} size={15} />
        <span className={styles.statLabel}>{label}</span>
      </Flexbox>
      <div className={styles.statValue}>{value}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </Flexbox>
  </div>
));

StatCard.displayName = 'AgentOperationStatCard';

const formatDateTime = (value: Date | string | null) => {
  if (!value) return '';
  const date = new Date(value);

  return date.toLocaleString(undefined, {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  });
};

const AgentOperationStats = memo(() => {
  const { t } = useTranslation('setting');
  const agentId = useAgentStore((s) => s.activeAgentId);

  const { data, error, isLoading } = lambdaQuery.agent.getOperationStats.useQuery(
    { agentId: agentId || '', days: 30 },
    { enabled: !!agentId },
  );

  const maxTokens = useMemo(
    () => Math.max(1, ...(data?.daily.map((item) => item.totalTokens) ?? [])),
    [data?.daily],
  );

  if (isLoading) {
    return (
      <Flexbox className={styles.card} gap={16}>
        <Skeleton active paragraph={{ rows: 8 }} title={false} />
      </Flexbox>
    );
  }

  if (error) {
    return (
      <Center className={`${styles.card} ${styles.emptyCard}`}>
        <Empty description={t('heterogeneousStatus.usage.error')} icon={Activity} />
      </Center>
    );
  }

  if (!data || data.summary.operationCount === 0) {
    return (
      <Center className={`${styles.card} ${styles.emptyCard}`}>
        <Empty description={t('heterogeneousStatus.usage.empty')} icon={Activity} />
      </Center>
    );
  }

  const { summary } = data;
  const successRate = `${Math.round(summary.successRate * 100)}%`;

  return (
    <Flexbox gap={16}>
      <Flexbox horizontal gap={12} style={{ flexWrap: 'wrap' }}>
        <StatCard
          icon={CircleDollarSign}
          label={t('heterogeneousStatus.usage.cost')}
          value={`$${formatPrice(summary.totalCost, 2)}`}
          sub={t('heterogeneousStatus.usage.costSub', {
            count: formatShortenNumber(summary.operationCount),
          })}
        />
        <StatCard
          icon={Zap}
          label={t('heterogeneousStatus.usage.tokens')}
          value={String(formatShortenNumber(summary.totalTokens))}
          sub={t('heterogeneousStatus.usage.tokensSub', {
            input: formatShortenNumber(summary.totalInputTokens),
            output: formatShortenNumber(summary.totalOutputTokens),
          })}
        />
        <StatCard
          icon={ListChecks}
          label={t('heterogeneousStatus.usage.runs')}
          value={String(formatShortenNumber(summary.operationCount))}
          sub={t('heterogeneousStatus.usage.runsSub', {
            failed: formatShortenNumber(summary.failedOperations),
            successRate,
          })}
        />
        <StatCard
          icon={Clock3}
          label={t('heterogeneousStatus.usage.duration')}
          value={formatTime(summary.averageDurationMs / 1000)}
          sub={t('heterogeneousStatus.usage.durationSub', {
            steps: summary.averageStepCount.toFixed(1),
          })}
        />
      </Flexbox>

      <Flexbox className={styles.card} gap={14}>
        <Flexbox horizontal align="center" justify="space-between">
          <span className={styles.title}>{t('heterogeneousStatus.usage.chartTitle')}</span>
          <div className={styles.chartLegend}>
            <Flexbox horizontal align="center" gap={5}>
              <span className={styles.legendDotInput} />
              {t('heterogeneousStatus.usage.input')}
            </Flexbox>
            <Flexbox horizontal align="center" gap={5}>
              <span className={styles.legendDotOutput} />
              {t('heterogeneousStatus.usage.output')}
            </Flexbox>
          </div>
        </Flexbox>
        <div className={styles.chartWrap}>
          <div
            className={styles.chart}
            style={{ gridTemplateColumns: `repeat(${data.daily.length}, minmax(14px, 1fr))` }}
          >
            {data.daily.map((item) => {
              const height =
                item.totalTokens > 0
                  ? Math.max(2, Math.round((item.totalTokens / maxTokens) * 150))
                  : 0;
              const inputHeight =
                item.totalTokens > 0
                  ? Math.max(1, Math.round((item.totalInputTokens / item.totalTokens) * height))
                  : 0;
              const outputHeight = Math.max(0, height - inputHeight);
              const label = item.date.slice(5).replace('-', '/');

              return (
                <Tooltip
                  key={item.date}
                  title={t('heterogeneousStatus.usage.chartTooltip', {
                    cost: `$${formatPrice(item.totalCost, 4)}`,
                    date: item.date,
                    input: formatShortenNumber(item.totalInputTokens),
                    output: formatShortenNumber(item.totalOutputTokens),
                    runs: item.operationCount,
                    tokens: formatShortenNumber(item.totalTokens),
                  })}
                >
                  <div className={styles.chartColumn}>
                    <div className={styles.bar} style={{ height }}>
                      {outputHeight > 0 && (
                        <div className={styles.barOutput} style={{ height: outputHeight }} />
                      )}
                      {inputHeight > 0 && (
                        <div className={styles.barInput} style={{ height: inputHeight }} />
                      )}
                    </div>
                    <div className={styles.chartLabel}>{label}</div>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </Flexbox>

      <Flexbox className={styles.card} gap={12}>
        <Flexbox horizontal align="center" justify="space-between">
          <span className={styles.title}>{t('heterogeneousStatus.usage.recentTitle')}</span>
          <Text type="secondary">
            {t('heterogeneousStatus.usage.callsSub', {
              llm: formatShortenNumber(summary.llmCalls),
              tools: formatShortenNumber(summary.toolCalls),
            })}
          </Text>
        </Flexbox>
        <div className={styles.recentHeader}>
          <span>{t('heterogeneousStatus.usage.columns.run')}</span>
          <span>{t('heterogeneousStatus.usage.columns.model')}</span>
          <span>{t('heterogeneousStatus.usage.columns.tokens')}</span>
          <span>{t('heterogeneousStatus.usage.columns.cost')}</span>
          <span>{t('heterogeneousStatus.usage.columns.duration')}</span>
        </div>
        <div>
          {data.recentOperations.map((item) => (
            <div className={styles.recentRow} key={item.id}>
              <Flexbox gap={4} style={{ minWidth: 0 }}>
                <Flexbox horizontal align="center" gap={6}>
                  <Tag
                    color={STATUS_COLOR[item.status] ?? 'default'}
                    style={{ marginInlineEnd: 0 }}
                  >
                    {t(`heterogeneousStatus.usage.status.${item.status}`, {
                      defaultValue: item.status,
                    })}
                  </Tag>
                  <Text code ellipsis fontSize={12} title={item.id}>
                    {item.id}
                  </Text>
                </Flexbox>
                <Text fontSize={12} type="secondary">
                  {formatDateTime(item.createdAt)}
                </Text>
              </Flexbox>
              <Flexbox horizontal align="center" gap={6} style={{ minWidth: 0 }}>
                <Icon icon={Bot} size={13} style={{ color: cssVar.colorTextTertiary }} />
                <Text ellipsis fontSize={13}>
                  {[item.provider, item.model].filter(Boolean).join(' / ') || '-'}
                </Text>
              </Flexbox>
              <Text fontSize={13}>{formatShortenNumber(item.totalTokens)}</Text>
              <Text fontSize={13}>{`$${formatPrice(item.totalCost, 4)}`}</Text>
              <Text fontSize={13}>{formatTime(item.processingTimeMs / 1000)}</Text>
            </div>
          ))}
        </div>
      </Flexbox>
    </Flexbox>
  );
});

AgentOperationStats.displayName = 'AgentOperationStats';

export default AgentOperationStats;

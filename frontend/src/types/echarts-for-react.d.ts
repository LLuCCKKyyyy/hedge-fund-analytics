declare module 'echarts-for-react' {
  import { CSSProperties } from 'react';
  import { EChartsOption } from 'echarts';

  interface ReactEChartsProps {
    option: EChartsOption;
    style?: CSSProperties;
    className?: string;
    theme?: string | object;
    notMerge?: boolean;
    lazyUpdate?: boolean;
    loading?: boolean;
    onEvents?: Record<string, Function>;
  }

  export default class ReactECharts extends React.Component<ReactEChartsProps> {}
}

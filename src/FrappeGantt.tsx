import React, { createRef } from "react";
import Gantt from "frappe-gantt";
import { Moment } from "moment";

export class Task {
  private _dependencies: string[] = [];

  id: string = "";
  name: string = "";
  start: string = "";
  end: string = "";

  constructor(options: Partial<Task> = {}) {
    Object.assign(this, options);
  }

  /**
   * Progress in percentage
   */
  progress: number = 0;

  /**
   * A css custom class for the task chart bar
   */
  custom_class?: string;

  setDependencies(value: string[]) {
    this._dependencies = value;
  }

  set dependencies(value: string) {
    this._dependencies = value.split(",").map(d => d.trim());
  }

  get dependencies(): string {
    return this._dependencies.join(", ");
  }
}

export enum ViewMode {
  QuarterDay = "Quarter Day",
  HalfDay = "Half Day",
  Day = "Day",
  Week = "Week",
  Month = "Month"
}

export type FrappeGanttProps = {
  tasks: Task[];
} & Partial<FrappeGanttOptionalProps>;

export type FrappeGanttOptionalProps = Readonly<typeof frappeGanttDefaultProps>;

const frappeGanttDefaultProps = {
  viewMode: ViewMode.Day,
  onTasksChange: (tasks: Task[]) => {},
  onClick: (task: Task) => {},
  onDateChange: (task: Task, start: Moment, end: Moment) => {},
  onProgressChange: (task: Task, progress: number) => {},
  onViewChange: (mode: ViewMode) => {}
};

export class FrappeGantt extends React.Component<FrappeGanttProps, any> {
  private _target = createRef<HTMLDivElement>();
  private _svg = createRef<SVGSVGElement>();
  private _gantt: any = null;

  static defaultProps = frappeGanttDefaultProps;

  state = {
    viewMode: null
  };

  static getDerivedStateFromProps(nextProps: FrappeGanttProps, state: any) {
    return {
      viewMode: nextProps.viewMode
    };
  }

  componentDidUpdate() {
    if (this._gantt) {
      this._gantt.change_view_mode(this.state.viewMode);
    }
  }

  componentDidMount() {
    this._gantt = new Gantt(this._svg.current, this.props.tasks, {
      on_click: this.props.onClick,
      on_view_change: this.props.onViewChange,
      on_progress_change: (task: Task, progress: number) => {
        this.props.onProgressChange!(task, progress);
        this.props.onTasksChange!(this.props.tasks);
      },
      on_date_change: (task: Task, start: Moment, end: Moment) => {
        this.props.onDateChange!(task, start, end);
        this.props.onTasksChange!(this.props.tasks);
      }
    });

    if (this._gantt) {
      this._gantt.change_view_mode(this.state.viewMode);
    }

    const midOfSvg = this._svg.current!.clientWidth * 0.5;
    this._target.current!.scrollLeft = midOfSvg;
  }

  render() {
    return (
      <div style={{ overflow: "scroll" }} ref={this._target}>
        <svg
          ref={this._svg}
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        />
      </div>
    );
  }
}

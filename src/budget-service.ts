import moment = require('moment')

interface IRepo {
  getAll(): Budget[]
}

interface Budget {
  yearMonth: string
  amount: number
}

export class BudgetService {
  private repo: IRepo

  constructor(repo: IRepo) {
    this.repo = repo
  }

  public queryBudget(start: moment.Moment, end: moment.Moment) {
    if (start.format('YYYYMM') !== end.format('YYYYMM')) {
      const startMonth = start.month()
      let sum = 0
      while (start <= end) {
        const budget = this.getBudgetByYearMonth(start)
        let proportion = 1

        if (start.month() === startMonth) {
          proportion = this.getProportionOfMonth(
            start,
            start.clone().endOf('month')
          )
        } else if (start.month() === end.month()) {
          proportion = this.getProportionOfMonth(
            start.clone().startOf('month'),
            end
          )
        }

        sum += budget * proportion

        start.date(1).add(1, 'month')
      }

      return Math.round(sum * 100) / 100
    }

    if (start.format('YYYYMM') === end.format('YYYYMM')) {
      const budget = this.getBudgetByYearMonth(start)

      const days = end.diff(start, 'days') + 1
      const daysInMonth = start.daysInMonth()
      const proportion = days / daysInMonth

      return Math.round(budget * proportion * 100) / 100
    }

    return 0
  }

  private getBudgetByYearMonth(m: moment.Moment) {
    const budgets = this.repo.getAll()
    const r = budgets.find((b) => b.yearMonth === m.format('YYYYMM'))
    return r ? r.amount : 0
  }

  private getProportionOfMonth(start: moment.Moment, end: moment.Moment) {
    const days = end.diff(start, 'days') + 1
    const daysInMonth = start.daysInMonth()
    return days / daysInMonth
  }
}

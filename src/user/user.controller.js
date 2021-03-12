const { HttpCodes } = require("../helpers/constants");
const User = require("./User");

async function getMonthIncomes(req, res, next) {
  const user = req.user;

  const monthesArr = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  function getMonthFromString(str) {
    return new Date(str).getMonth();
  }
  const incomesArr = user.operations.costs;
  const formatedIncomes = incomesArr
    .sort((a, b) => getMonthFromString(a.date) - getMonthFromString(b.date))
    .map((item) => ({
      date: monthesArr[+item.date.slice(0, 2) - 1],
      amount: item.amount,
    }))
    .reduce((acc, curr) => {
      if (!acc.some((el) => el.date === curr.date)) {
        acc.push(curr);
      } else {
        const neededArr = acc.find((el) => el.date === curr.date);
        neededArr.amount += curr.amount;
      }
      return acc;
    }, []);

  return res
    .status(200)
    .send({ user: { operations: { costs: formatedIncomes } } });
}

async function getMonthInformation(req, res) {
  const { date } = req.body;
  const user = await User.findOne(req.user._id);

  const year = date.split("-")[0];
  const month = date.split("-")[1];

  const yearCostsArr = user.operations.costs.filter(
    (el) => year === el.date.split("-")[2],
  );

  const monthCostsArr = yearCostsArr.filter(
    (el) => month === el.date.split("-")[1],
  );

  const totalCosts = monthCostsArr.reduce(
    (acc, el) => acc + Number(el.amount),
    0,
  );

  const costs = {
    total: totalCosts,
  };

  monthCostsArr.forEach((el) => {
    if (costs[el.category]) {
      if (costs[el.category][el.description]) {
        const price = +costs[el.category][el.description] + +el.amount;
        costs[el.category][el.description] = price;
      } else
        costs[el.category] = {
          ...costs[el.category],
          [el.description]: el.amount,
        };
    } else
      costs[el.category] = {
        ...costs[el.category],
        [el.description]: el.amount,
      };
  });

  for (let cost in costs) {
    if (cost !== "total") {
      const costObj = costs[cost];
      if (!costObj.total) {
        costObj.total = 0;
      }
      for (let descr in costObj) {
        const price = costObj[descr]

        if (descr !== 'total') {
          costObj.total = costObj.total + price
        }
      }
    }
  }

  const yearIncomesArr = user.operations.incomes.filter(
    (el) => year === el.date.split("-")[2],
  );

  const monthIncomesArr = yearIncomesArr.filter(
    (el) => month === el.date.split("-")[1],
  );

  const totalIncomes = monthIncomesArr.reduce(
    (acc, el) => acc + Number(el.amount),
    0,
  );

  const incomes = {
    total: totalIncomes,
  };

  monthIncomesArr.forEach((el) => {
    if (incomes[el.category]) {
      if (incomes[el.category][el.description]) {
        const price = +incomes[el.category][el.description] + +el.amount;
        incomes[el.category][el.description] = price;
      } else
        incomes[el.category] = {
          ...incomes[el.category],
          [el.description]: el.amount,
        };
    } else
      incomes[el.category] = {
        ...incomes[el.category],
        [el.description]: el.amount,
      };
  });

  for (let income in incomes) {
    if (income !== "total") {
      const incomeObj = incomes[income];
      if (!incomeObj.total) {
        incomeObj.total = 0;
      }
      for (let descr in incomeObj) {
        const price = incomeObj[descr]

        if (descr !== 'total') {
          incomeObj.total = incomeObj.total + price
        }
      }
    }
  }
  
  res.status(HttpCodes.OK).json({
    costs: costs,
    incomes: incomes
  });
}
async function getMonthCosts(req, res, next) {
  const user = req.user;

  const monthesArr = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  function getMonthFromString(str) {
    return new Date(str).getMonth();
  }
  const costsArr = user.operations.costs;
  const formatedCost = costsArr
    .sort((a, b) => getMonthFromString(a.date) - getMonthFromString(b.date))
    .map((item) => ({
      date: monthesArr[+item.date.slice(0, 2) - 1],
      amount: item.amount,
    }))
    .reduce((acc, curr) => {
      if (!acc.some((el) => el.date === curr.date)) {
        acc.push(curr);
      } else {
        const neededArr = acc.find((el) => el.date === curr.date);
        neededArr.amount += curr.amount;
      }
      return acc;
    }, []);

  return res
    .status(200)
    .send({ user: { operations: { costs: formatedCost } } });
}

async function userIncome(req, res) {
  const { user } = req;
  const { body } = req;
  let incomes = [...user.operations.incomes];
  let total = 0;

  incomes = [...incomes, body];

  incomes.map((el) => {
    if (el.category === body.category) {
      total += +el.amount;
    }
  });

  if(incomes.length > 1) {
    incomes = incomes.filter(el => el.category === body.category)
  }

  user.operations.incomes = [...incomes];

  const updatedUser = await User.findByIdAndUpdate(user._id, user, {
    new: true,
  });

  return res
    .send({
      categoryTotal: total,
    })
    .status(201);
}

async function deleteIncome(req, res) {
  const { user } = req;
  const { body } = req;
  let incomes = [...user.operations.incomes];

  incomes = incomes.filter(el => el.id !== body.id);

  user.operations.incomes = [...incomes];

  const updatedUser = await User.findByIdAndUpdate(user._id, user, {
    new: true,
  });

  return res.send("It's OK").status(200);

}

async function deleteCosts(req, res) {
  const { user } = req;
  const { body } = req;
  let costs = [...user.operations.costs];

  costs = costs.filter(el => el.id !== body.id);

  user.operations.costs = [...costs];

  const updatedUser = await User.findByIdAndUpdate(user._id, user, {
    new: true,
  });

  return res.send("It's OK").status(200);

}

async function userCosts(req, res) {
  const { user } = req;
  const { body } = req;
  let costs = [...user.operations.costs];
  let total = 0;

  costs = [...costs, body];

  costs.map((el) => {
    if (el.category === body.category) {
      total += +el.amount;
    }
  });

  if(costs.length > 1) {
    costs = costs.filter(el => el.category === body.category)
  }

  user.operations.costs = [...costs];

  const updatedUser = await User.findByIdAndUpdate(user._id, user, {
    new: true,
  });

  return res
    .send({
      categoryTotal: total,
    })
    .status(201);
}

module.exports = {
  deleteIncome,
  deleteCosts,
  userIncome,
  userCosts,
  getMonthCosts,
  getMonthIncomes,
  getMonthInformation,
};

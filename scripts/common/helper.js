/**
 * extract random user from the list
 */
export const GetRandomAccounts = numberToGet => {

    const fileName = __ENV.USERS_FILE ? __ENV.USERS_FILE : "users.json";
    const accounts = JSON.parse(open("../data-gen/" + fileName));
  
    let counter = 0;
    let max = accounts.length;
    let chosenAccounts = [];
    let chosenAccountIds = [];
  
    if (numberToGet >= accounts.length) {
      for (let i = 0; i < accounts.length; i++) chosenAccounts.push(accounts[i]);
  
      return chosenAccounts;
    }
  
    while (counter < numberToGet) {
      let randNum = GetRandomIntInRange(max);
      let accountToAdd = accounts[randNum - 1];
      if (!chosenAccountIds.includes(accountToAdd.id)) {
        chosenAccountIds.push(accountToAdd.id);
        chosenAccounts.push(accountToAdd);
        counter++;
      }
    }
    return chosenAccounts;
  };
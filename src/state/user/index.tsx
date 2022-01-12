import { atom, selector } from "recoil";
import { validateToken } from "./services";

export const BASE_URL = "http://localhost:5000"

export const userState = atom({
  key: "userState",
  default: JSON.parse(localStorage.getItem("user") as string),
});

export const loggedInState = selector({
  key: "isLoggedIn",
  get: async ({ get }) => {
    const user = get(userState);
    console.log(user);

    if (user) {
      if (await validateToken(user.token)) {
        return true;
      } else {
        return false;
      }
    } else {
      localStorage.removeItem("user");
      return false;
    }
  },
});
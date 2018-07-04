/**
 * Created by JasonDeniega on 03/07/2018.
 */
import { UsersPage } from "../pages/users/users";
import { InventoryPage } from "../pages/inventory/inventory";
import { SignInPage } from "../pages/sign_in/sign_in";
import { RemittancePage } from "../pages/remittances/remittances";
import { NotFoundPage } from "../pages/not_found/not_found";


export const SIGN_IN_PAGE = {
    identifier: "SIGN_IN_PAGE",
    path: "sign-in",
    name: "Sign-in",
    component: SignInPage,
};

export const REMITTANCE_PAGE = {
    identifier: "REMITTANCE_PAGE",
    path: "remittances",
    component: RemittancePage,
    name: "Remittance",

};

export const INVENTORY_PAGE= {
    identifier: "INVENTORY_PAGE",
    path: "inventory",
    component: InventoryPage,
    name: "Inventory",

};
export const USERS_PAGE= {
    identifier: "USERS_PAGE",
    path: "users",
    component: UsersPage,
    name: "Users",

};
export const NOT_FOUND_PAGE= {
    identifier: "NOT_FOUND",
    path: "404",
    component: NotFoundPage,
    name: "Inventory",
};

export const GENERAL_PAGES = [
    SIGN_IN_PAGE,
    NOT_FOUND_PAGE,
];

export const PAGES = [
    REMITTANCE_PAGE,
    INVENTORY_PAGE,
    USERS_PAGE,
    SIGN_IN_PAGE,
];


export function getPageFromPath(candidatePath) {
    const page = PAGES.find(page => page.path === candidatePath);
    if (!page) {
        // If path is not found, it means path is invalid, return not found
        return NOT_FOUND_PAGE;
    }
    return page;
}

export function getPageFromIdentifier(candidateIdentifier) {
    const page = PAGES.find(page => page.identifier === candidateIdentifier);
    if (!page) {
        // If path is not found, it means path is invalid, return not found
        return NOT_FOUND_PAGE;
    }
    return page;
}
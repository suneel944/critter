import type { Page } from '@playwright/test'
import { LoginPage } from './LoginPage'
import { ProductDetailsPage } from './ProductDetailsPage'
import { CartPage } from './CartPage'
import { DashboardPage } from './DashboardPage'
import { BasePage } from '../BasePage'

export class AutomationExercise extends BasePage {
    
    constructor(readonly page: Page) {
        super(page)
    }
    
    private _login?: LoginPage
    get login(): LoginPage {
        return (this._login??= new LoginPage(this.page))
    }

    private _productDetails?: ProductDetailsPage
    get productDetails(): ProductDetailsPage {
        return (this._productDetails??= new ProductDetailsPage(this.page))
    }

    private _cart?: CartPage
    get cart(): CartPage {
        return (this._cart??=new CartPage(this.page))
    }

    private _dashboard?: DashboardPage
    get dashboard(): DashboardPage {
        return (this._dashboard??= new DashboardPage(this.page))
    }
}
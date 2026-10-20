// Response of GET {api}/getfullresources (and the test-mode endpoint), as captured on 2026-10-15.
// Samples: failover-handover/docs/reference/api-samples/. Only the fields the kiosk reads are typed.

export interface TmkRoot {
  ThemeResponse: TmkTheme
  TMKData: TmkLangData[]
  Settings?: { SendOrderRetryCount?: number }
}

export interface TmkTheme {
  RestaurantName?: string | null
  LanguagesList?: { Name: string; Locale: string }[]
  LogoImage?: { Url: string } | null
  CoverImage?: { Url: string } | null
  CurrencySettings?: { CurrencySymbol?: string; CurrencyName?: string }
}

export interface TmkLangData {
  Language: string
  MainCategories: TmkMainCategory[]
  UpsaleColletions?: TmkUpsaleCollection[] | null
  Screensaver?: TmkScreensaver | null
}

export interface TmkScreensaver {
  SlideTimer: number
  ActivationTime: number
  Transparency: number
  Slides: TmkSlide[]
}

export interface TmkSlide {
  ImageUrl: string
  DisplayOrder: number
  UseTime: boolean
  TimeFrom: string
  TimeTo: string
  /** eMenu tablet conditions (activation count, AYCE round): no kiosk equivalent. */
  UseActivation: boolean
  FromActivation: number
  EndActivation: number
  UseRound: boolean
  FromRound: number
  ToRound: number
  IdSubcategoryInMenu?: number | null
  IdProductInMenu?: number | null
}

export interface TmkMainCategory {
  MainCategoryId: number
  Name: string
  DisplayOrder: number
  SubCategories: TmkSubCategory[]
}

export interface TmkSubCategory {
  SubCategoryId: number
  Name: string
  DisplayOrder: number
  Products: TmkProduct[]
}

export interface TmkProduct {
  ProductId: number
  SubCategoryId: number
  Name: string
  Price: number
  DisplayOrder: number
  SmallPictureUrl?: string | null
  IdOtherPos?: string | null
  OutOfStock?: boolean
  /** Quantity cap per line (old kiosk: detail-sheet stepper stops here). Seen: 1, 50000, 99999, 999999. */
  MaxAmountInAgenda?: number | null
  /** Information-only product: shown, opens the detail page, cannot be ordered. */
  NoInteraction?: boolean
  /** Promotion switch; the kiosk shows the product as a promo card between PromotionFrom and PromotionTo (local time, no zone). */
  IsPromotion?: boolean
  PromotionFrom?: string | null
  PromotionTo?: string | null
  IsSpicy?: boolean
  IsVegan?: boolean
  IsVegetarian?: boolean
  IsPregnancyNotSuitable?: boolean
  HasModifiers?: boolean
  /** Modifier wizards of the product (one group each). Used again since 2026-10-20 (decision D3 revived). */
  ModifierWizards?: TmkModifierWizard[] | null
  HasUpsaleCollection?: boolean
  UpsaleCollectionId?: number | null
  ProductDetails?: {
    ProductPictureUrl?: string | null
    MenuItems?: TmkMenuItem[] | null
  } | null
}

export interface TmkMenuItem {
  Name: string
  Active?: boolean
  HtmlContent?: string | null
  AllergensScreen?: { Allergens?: { AllergenTypeId: number; Description?: string; IsActive: boolean }[] | null } | null
}

export interface TmkUpsaleCollection {
  Id: number
  CollectionName: string
  UpsaleSteps: TmkUpsaleStep[]
}

export interface TmkUpsaleStep {
  Id: number
  Name: string
  DisplayOrder: number
  MinSelection: number
  MaxSelection: number
  NextStepId?: number | null
  Options: {
    Id: number
    ProductId?: number | null
    Name: string
    Price: number
    PictureUrl?: string | null
    MaxSelection: number
    OptionOrder: number
    Finish: boolean
    OverrideNextStepId?: number | null
  }[]
}

/** A modifier group of a product. ListType 0|1 (meaning undocumented; 1 seen with 1/1, 0 with 0/n). */
export interface TmkModifierWizard {
  MainProductId: number
  ModifierId: number
  Title: string
  SubTitle?: string | null
  ListType?: number
  IsMandatory: boolean
  SelectionMin: number
  SelectionMax: number
  DisplayOrder: number
  ModifierItemElements: TmkModifierItem[]
}

/** One option of a modifier group. `ProductId` is the backend product that is ordered when it is picked. */
export interface TmkModifierItem {
  ProductId: number | null
  Name: string
  Description?: string | null
  ProductPictureUrl?: string | null
  Price: number
  DisplayOrder: number
  IdOtherPos?: string | null
  DefaultSelected?: boolean
  ModifiersWizardId?: number
}

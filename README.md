# SG Resources Inc website

The website for [SG Resources Inc](https://www.sgresourcesinc.com/): shipping, logistics and procurement from Stafford, Texas.
It's a static site hosted on GitHub Pages.

## Pages

- `index.html`: homepage (services, FAQ, offices, quote form)
- `freight-forwarding.html`, `vehicles.html` (includes the U.S. car export checklist), `procurement.html`, `warehousing.html`, `construction.html`, `other-services.html`
- `shipping-policy.html`, `privacy.html`, `accessibility.html`, `404.html`
- Redirect pages for the old Wix addresses (for example `freight-fowarding-logistic-services.html`), so existing links and search results still work

## Editing

Edit the files in `src/`, not the generated `.html` files in the root:

- `src/_top.html` and `src/_bottom.html`: header and footer, shared by every page
- `src/pages/*.html`: the content of each page
- `assets/site.css` and `assets/site.js`: styles and scripts
- `build.py`: site settings (domain, WhatsApp number, Formspree form ID, old-URL redirects)

Then run `python build.py` to regenerate the pages and `sitemap.xml`, and commit.

## Quote form

The form sends requests to info@sgresourcesinc.com through [Formspree](https://formspree.io/).
Set `FORMSPREE_ID` in `build.py` to the form ID, then rebuild. While it's empty, "Send request" opens the visitor's email app instead.
"Send on WhatsApp" works either way.

## Photos

The photos are free-license stand-ins from Wikimedia Commons, credited in the footer. To use your own, replace the files in `img/` with the same names
(or change the paths in `src/`), and update the credits line in `src/_bottom.html`.

## Image credits

The SG Resources logo belongs to SG Resources Inc. All photos come from Wikimedia Commons and have been resized and cropped:

- Bayport Container Terminal, by [formulanone](https://commons.wikimedia.org/wiki/File:Bayport_Container_Terminal_Aerial_-_Near_Houston_(43373625235).jpg). CC BY-SA 2.0
- Car carrier *Höegh Sunlight*, by [IikaJzuchiN](https://commons.wikimedia.org/wiki/File:Car_carrier_vessel_HOEGH_SUNLIGHT_underway.jpg). CC BY 4.0
- Cargo at the Port of Houston, by [Roy Luck](https://commons.wikimedia.org/wiki/File:General_cargo_for_export_from_the_Port_of_Houston_docks_(7005519857).jpg). CC BY 2.0
- 747 freighter, by [Frank Kovalchek](https://commons.wikimedia.org/wiki/File:Cathay_Pacific_747_Freighter_starting_its_takeoff_roll_(6259573540).jpg). CC BY 2.0
- Warehouse, by [Axisadman](https://commons.wikimedia.org/wiki/File:Modern_warehouse_with_pallet_rack_storage_system.jpg). CC BY-SA 3.0
- Apapa port, Lagos, by [Quadrex24](https://commons.wikimedia.org/wiki/File:Apapa_port.lagos.jpg). CC BY-SA 4.0

The ships, aircraft and facilities shown are not affiliated with SG Resources.

/* Existing web photographs, downloaded unchanged. No generated logos or images. */
globalThis.StillwaterMedia = (() => {
  const photos = [
    {
      id: "ad-dog",
      file: "web/ad-dog.jpg",
      title: "Dog resting on the grass.jpg",
      author: "Joselodos",
      license: "CC0",
      license_url: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      source:
        "https://commons.wikimedia.org/wiki/File:Dog_resting_on_the_grass.jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Dog_resting_on_the_grass.jpg/960px-Dog_resting_on_the_grass.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      sha256:
        "3d7124dd3dd12544571816d152a8ae1e3174a731a7c78f583a93990ca60cf65a",
      bytes: 248335,
      changes:
        "Wikimedia thumbnail; file bytes unmodified. Display crops use CSS object-fit only.",
      description: "Dog resting on the grass",
      group: "ad",
      alt: ["草地上休息的小狗", "A dog resting on grass"],
      caption: ["草地上休息的小狗", "A dog resting on grass"],
      width: 960,
      height: 640,
    },
    {
      id: "ad-cinema",
      file: "web/ad-cinema.jpg",
      title: "Columbia City Cinema main hall.jpg",
      author: "Joe Mabel",
      license: "CC BY-SA 3.0",
      license_url: "https://creativecommons.org/licenses/by-sa/3.0/",
      source:
        "https://commons.wikimedia.org/wiki/File:Columbia_City_Cinema_main_hall.jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Columbia_City_Cinema_main_hall.jpg/960px-Columbia_City_Cinema_main_hall.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      sha256:
        "b2c72ea89aa9dde21326c3de03345111c11abe37b7d3a4846a7ee6dd1abbf9c3",
      bytes: 129259,
      changes:
        "Wikimedia thumbnail; file bytes unmodified. Display crops use CSS object-fit only.",
      description:
        "Main auditorium, Columbia City Cinema, Columbia City neighborhood, Seattle, Washington.",
      group: "ad",
      alt: ["空影院里的红色座椅", "Red seats in an empty cinema"],
      caption: ["空影院里的红色座椅", "Red seats in an empty cinema"],
      width: 960,
      height: 720,
    },
    {
      id: "ad-computer",
      file: "web/ad-computer.jpg",
      title: "Keyboard Close Up.jpg",
      author: "Alexander-design",
      license: "CC0",
      license_url: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      source: "https://commons.wikimedia.org/wiki/File:Keyboard_Close_Up.jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Keyboard_Close_Up.jpg/960px-Keyboard_Close_Up.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      sha256:
        "cbbdc6a2fc45f0118906d19c0edf18e2cf66762344da45f661fcef2a1c15df98",
      bytes: 79645,
      changes:
        "Wikimedia thumbnail; file bytes unmodified. Display crops use CSS object-fit only.",
      description: "Close up image of keyboard buttons and design.",
      group: "ad",
      alt: ["电脑键盘特写", "A close-up of a computer keyboard"],
      caption: ["电脑键盘特写", "A close-up of a computer keyboard"],
      width: 960,
      height: 515,
    },
    {
      id: "ad-records",
      file: "web/ad-records.jpg",
      title: "Vinyl collection at a record store (Unsplash).jpg",
      author: "Mr Cup / Fabien Barral iammrcup",
      license: "CC0",
      license_url: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      source:
        "https://commons.wikimedia.org/wiki/File:Vinyl_collection_at_a_record_store_(Unsplash).jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Vinyl_collection_at_a_record_store_%28Unsplash%29.jpg/960px-Vinyl_collection_at_a_record_store_%28Unsplash%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      sha256:
        "ea9426afdb705f1a16ab9d7ae23f4cf7e5bcb5981a073ef77870108dc3364f34",
      bytes: 148094,
      changes:
        "Wikimedia thumbnail; file bytes unmodified. Display crops use CSS object-fit only.",
      description: "Vinyles d'occasion chez un disquaire à Lyon, France",
      group: "ad",
      alt: ["唱片店里的旧唱片", "Used vinyl records in a shop"],
      caption: ["唱片店里的旧唱片", "Used vinyl records in a shop"],
      width: 960,
      height: 638,
    },
    {
      id: "ad-print",
      file: "web/ad-print.jpg",
      title: "On demand book printer 17.jpg",
      author: "Dvortygirl",
      license: "CC BY-SA 4.0",
      license_url: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:On_demand_book_printer_17.jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/On_demand_book_printer_17.jpg/960px-On_demand_book_printer_17.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      sha256:
        "61cc719cbf035d0e2fc4647fd3d63c52fa41a2dd8f8d89218bd22cdb73f1073d",
      bytes: 131945,
      changes:
        "Wikimedia thumbnail; file bytes unmodified. Display crops use CSS object-fit only.",
      description:
        "An on-demand book printer at the Internet Archive headquarters in San Francisco, California. This stack of paper is a copy of Darwin's Origin of the Species ready to be bound and cut.",
      group: "ad",
      alt: ["打印设备中的纸张", "Paper inside a printing machine"],
      caption: ["打印设备中的纸张", "Paper inside a printing machine"],
      width: 960,
      height: 720,
    },
    {
      id: "ad-cat",
      file: "web/ad-cat.jpg",
      title: "Tabby cat with blue eyes-3336579.jpg",
      author: "AdinaVoicu",
      license: "CC0",
      license_url: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      source:
        "https://commons.wikimedia.org/wiki/File:Tabby_cat_with_blue_eyes-3336579.jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Tabby_cat_with_blue_eyes-3336579.jpg/960px-Tabby_cat_with_blue_eyes-3336579.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      sha256:
        "cf439a8a90cd05d5922818c34129116fa64eb676c0a0a702295e85d5879e55c2",
      bytes: 191206,
      changes:
        "Wikimedia thumbnail; file bytes unmodified. Display crops use CSS object-fit only.",
      description:
        "Portrait of a black tabby and white cat with Dominant Blue Eyes (DBE)",
      group: "ad",
      alt: ["蓝眼睛的猫", "A blue-eyed cat"],
      caption: ["蓝眼睛的猫", "A blue-eyed cat"],
      width: 960,
      height: 1153,
    },
    {
      id: "ad-cat-snow",
      file: "web/ad-cat-snow.jpg",
      title: "Felis catus-cat on snow.jpg",
      author: "Von.grzanka",
      license: "CC BY-SA 3.0",
      license_url: "https://creativecommons.org/licenses/by-sa/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Felis_catus-cat_on_snow.jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Felis_catus-cat_on_snow.jpg/960px-Felis_catus-cat_on_snow.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      sha256:
        "a34ee05fe8cb1badd2d7ffbeec2257c79f3683bd3ea0aef2b4ec709e42878734",
      bytes: 126936,
      changes:
        "Wikimedia thumbnail; file bytes unmodified. Display crops use CSS object-fit only.",
      description: "Domestic cat, a ten month old female.",
      group: "ad",
      alt: ["雪地里的虎斑猫", "A tabby cat in the snow"],
      caption: ["雪地里的虎斑猫", "A tabby cat in the snow"],
      width: 960,
      height: 640,
    },
    {
      id: "ad-cat-tabby",
      file: "web/ad-cat-tabby.jpg",
      title: "Cat November 2010-1a.jpg",
      author: "Alvesgaspar",
      license: "CC BY-SA 3.0",
      license_url: "https://creativecommons.org/licenses/by-sa/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Cat_November_2010-1a.jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/960px-Cat_November_2010-1a.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      sha256:
        "9b46595fdf92b4a91d380e6b94721da5a68ec18ace40f4829a29db357d79bda5",
      bytes: 331846,
      changes:
        "Wikimedia thumbnail; file bytes unmodified. Display crops use CSS object-fit only.",
      description: "Young male tabby cat, Portugal.",
      group: "ad",
      alt: ["坐在窗边的虎斑猫", "A tabby cat sitting by a window"],
      caption: ["坐在窗边的虎斑猫", "A tabby cat sitting by a window"],
      width: 960,
      height: 1282,
    },
    {
      id: "ad-clouds",
      file: "web/ad-clouds.jpg",
      title: "White Cumulus Clouds against Blue Sky (4).jpg",
      author: "Lance Vanlewen",
      license: "CC BY-SA 4.0",
      license_url: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:White_Cumulus_Clouds_against_Blue_Sky_(4).jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/White_Cumulus_Clouds_against_Blue_Sky_%284%29.jpg/960px-White_Cumulus_Clouds_against_Blue_Sky_%284%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      sha256:
        "a0edc716f96abf55d9296b1829f21df01cc9339a203b430f8705fa2b1817395d",
      bytes: 99697,
      changes:
        "Wikimedia thumbnail; file bytes unmodified. Display crops use CSS object-fit only.",
      description: "White Cumulus Clouds against Blue Sky",
      group: "ad",
      alt: ["蓝天下的积云", "Cumulus clouds against a blue sky"],
      caption: ["蓝天下的积云", "Cumulus clouds against a blue sky"],
      width: 960,
      height: 618,
    },
    {
      id: "hotel-exterior",
      file: "web/hotel-exterior.jpg",
      title: "Lodge at the Stanley Hotel Estes Park Colorado 2018.jpg",
      author: "Leaflet",
      license: "CC BY-SA 4.0",
      license_url: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Lodge_at_the_Stanley_Hotel_Estes_Park_Colorado_2018.jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/Lodge_at_the_Stanley_Hotel_Estes_Park_Colorado_2018.jpg/1280px-Lodge_at_the_Stanley_Hotel_Estes_Park_Colorado_2018.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      sha256:
        "348121f45b23c7227c912739e82e92a5e21b80556a53520c0314da2d462a8b11",
      bytes: 191986,
      changes:
        "Wikimedia thumbnail; file bytes unmodified. Display crops use CSS object-fit only.",
      description: "The Lodge at the Stanley Hotel in Estes Park, Colorado.",
      group: "hotel",
      alt: ["旅馆外观", "Hotel exterior"],
      caption: ["旅馆外观", "Hotel exterior"],
      width: 1280,
      height: 732,
    },
    {
      id: "hotel-lounge",
      file: "web/hotel-lounge.jpg",
      title: "Lobby Stanley Hotel Estes Park Colorado 2024.jpg",
      author: "Larry D. Moore",
      license: "CC BY 4.0",
      license_url: "https://creativecommons.org/licenses/by/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Lobby_Stanley_Hotel_Estes_Park_Colorado_2024.jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Lobby_Stanley_Hotel_Estes_Park_Colorado_2024.jpg/1280px-Lobby_Stanley_Hotel_Estes_Park_Colorado_2024.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      sha256:
        "a212c36e1c40b7bf459e6527e9dea58d4079edfed4207e90761d8eaf51551eab",
      bytes: 434648,
      changes:
        "Wikimedia thumbnail; file bytes unmodified. Display crops use CSS object-fit only.",
      description:
        "The lobby of the Stanley Hotel in Estes Park, Colorado, United States.",
      group: "hotel",
      alt: ["前厅与公共休息区", "Reception hall and lounge"],
      caption: ["前厅与公共休息区", "Reception hall and lounge"],
      width: 1280,
      height: 853,
    },
    {
      id: "hotel-dayroom",
      file: "web/hotel-dayroom.jpg",
      title: "Music Room Stanley Hotel.JPG",
      author: "Sgerbic",
      license: "CC0",
      license_url: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      source:
        "https://commons.wikimedia.org/wiki/File:Music_Room_Stanley_Hotel.JPG",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Music_Room_Stanley_Hotel.JPG/1280px-Music_Room_Stanley_Hotel.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      sha256:
        "2e0db0857d5c02e38a9684eea920ab2c2f2a80c19d57a36fe157216a16951eac",
      bytes: 183543,
      changes:
        "Wikimedia thumbnail; file bytes unmodified. Display crops use CSS object-fit only.",
      description:
        "The music room from The Stanley Hotel, Estes Park, CO showing snow.",
      group: "hotel",
      alt: ["临窗活动室", "Day room with tall windows"],
      caption: ["临窗活动室", "Day room with tall windows"],
      width: 1280,
      height: 853,
    },
    {
      id: "hotel-dining",
      file: "web/hotel-dining.jpg",
      title:
        "Restaurant room of Amantaka luxury Resort & Hotel in Luang Prabang Laos.jpg",
      author: "Basile Morin",
      license: "CC BY-SA 4.0",
      license_url: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Restaurant_room_of_Amantaka_luxury_Resort_%26_Hotel_in_Luang_Prabang_Laos.jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/Restaurant_room_of_Amantaka_luxury_Resort_%26_Hotel_in_Luang_Prabang_Laos.jpg/1280px-Restaurant_room_of_Amantaka_luxury_Resort_%26_Hotel_in_Luang_Prabang_Laos.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      sha256:
        "9f9ca4aa21901edd35c62af730747869f57fa8ad7922a987e32fd8f97c0790b8",
      bytes: 236018,
      changes:
        "Wikimedia thumbnail; file bytes unmodified. Display crops use CSS object-fit only.",
      description:
        "Restaurant room of Amantaka luxury resort and hotel in Luang Prabang, Laos, for breakfasts, lunches and dinners. This room is used as an annex to the pool terrace. Amantaka is one of the 34 properties operated by Aman Resorts, hospitality company founded by Indonesian hotelier Adrian Zecha in 1988, present in more than 20 countries. The hotel, located in a French colonial building, opened in September 2009. A boutique hotel, it contains 24 lavish suites, encircling a central courtyard and is designed with a mixture of traditional Lao furnishings and modern. The suites range in size from 70 to 120 square metres and include eight suites, four pool suites, eight Khan pool suites, two Mekong pool suites and two Amantaka pool suites. All of the rooms have a king-sized bed centre of the suites beneath a traditional high ceiling. They are painted in white and have mahogany or dark wood furnishings and windows. The rooms are reported to be between 1,100 USD and 1,900 USD a night.",
      group: "hotel",
      alt: ["餐厅", "Dining room"],
      caption: ["餐厅", "Dining room"],
      width: 1280,
      height: 853,
    },
    {
      id: "hotel-garden",
      file: "web/hotel-garden.jpg",
      title:
        "Courtyard garden area - Deganwy Quay Hotel - geograph.org.uk - 8366451.jpg",
      author: "Richard Hoare",
      license: "CC BY-SA 2.0",
      license_url: "https://creativecommons.org/licenses/by-sa/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Courtyard_garden_area_-_Deganwy_Quay_Hotel_-_geograph.org.uk_-_8366451.jpg",
      download:
        "https://upload.wikimedia.org/wikipedia/commons/5/53/Courtyard_garden_area_-_Deganwy_Quay_Hotel_-_geograph.org.uk_-_8366451.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
      sha256:
        "0ee5695d5cdb2dd15b28f0772ce1c42118f426375749316fc02fa9832273dfe6",
      bytes: 285633,
      changes:
        "Wikimedia thumbnail; file bytes unmodified. Display crops use CSS object-fit only.",
      description: "Courtyard garden area - Deganwy Quay Hotel",
      group: "hotel",
      alt: ["庭院花园", "Courtyard garden"],
      caption: ["庭院花园", "Courtyard garden"],
      width: 768,
      height: 1024,
    },
    {
      id: "hotel-breakfast",
      file: "web/hotel-breakfast.jpg",
      title: "Coffee, breakfast, croissant.jpg",
      author: "Kurt Kaiser",
      license: "CC0",
      license_url: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      source:
        "https://commons.wikimedia.org/wiki/File:Coffee,_breakfast,_croissant.jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a6/Coffee%2C_breakfast%2C_croissant.jpg/1280px-Coffee%2C_breakfast%2C_croissant.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      sha256:
        "528b364a57199c6000175843260690e6765dcfaea5aed9bdf23e18079f4b0c7c",
      bytes: 251238,
      changes:
        "Wikimedia thumbnail; file bytes unmodified. Display crops use CSS object-fit only.",
      description: "breakfast",
      group: "hotel",
      alt: ["咖啡与早餐糕点", "Coffee and breakfast pastries"],
      caption: ["咖啡与早餐糕点", "Coffee and breakfast pastries"],
      width: 1280,
      height: 960,
    },
  ];
  const find = (id) => photos.find((photo) => photo.id === id);
  return Object.freeze({ photos, find });
})();

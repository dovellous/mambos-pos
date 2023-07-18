import React from "react"

import productsData from "./data/products.json";

import beepSound from "./assets/sounds/beep-29.mp3";

import buttonSound from "./assets/sounds/button-21.mp3";

import mambosLogo from "./assets/images/logo.png";

import noIMG from "./assets/images/no-image.jpg";

import { Br, Cut, Line, Printer, Text, Image, Row, Barcode, QRCode, render, Cashdraw } from 'react-thermal-printer';

import { TECollapse } from "tw-elements-react";

//import { connect } from 'node:net';

import Modal from 'react-modal';

export default function CashierPOS() {

  Modal.setAppElement('#root');

  const [isPaymentSet, setIsPaymentSet] = React.useState(false);

  const [paymentModalIsOpen, setPaymentModalIsOpen] = React.useState(false);

  const paymentModalCustomStyles:any = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '75vw',
      maxWidth: '400px',
      height: '75vh'
    },
  };

  const afterOpenPaymentModal: any = () => {
    
    //

  }

  function openPaymentModal() {
    setPaymentModalIsOpen(true);
  }

  function closePaymentModal() {
    setPaymentModalIsOpen(false);
  }

  //const [productAddonsModal, setProductAddonsModal] = React.useState(false);

  const [printAreaInnerHTML, setPrintAreaInnerHTML] = React.useState<any>("");

  const [isShowModalReceipt, setIsShowModalReceipt] = React.useState<boolean>(false);

  const [keyword, setKeyword] = React.useState<any>("");

  const getCardDetails:any = (readerData:any) => {

      let card = readerData.match(/%B([0-9]+)\^([A-Z /.]+)\/([A-Z /.]*)\^([0-9]{2})([0-9]{2})/);
  
      let lastName = card[2].trim();
      // 'LASTNAME/FIRSTNAME.MR' is possible
      let firstName = card[3].trim().split('.')[0];
      let fullName = `${firstName} ${lastName}`;
      let cardType = "";
      var re = new RegExp("^4");
      if (card[1].match(re) != null)
        cardType = "Visa";
    
      re = new RegExp("^(34|37)");
      if (card[1].match(re) != null)
        cardType = "American Express";
    
      re = new RegExp("^5[1-5]");
      if (card[1].match(re) != null)
        cardType = "MasterCard";
    
      re = new RegExp("^6011");
      if (card[1].match(re) != null)
        cardType = "Discover";
  
      return {
          exp_month: card[5],
          exp_year: card[4],
          number: card[1],
          name: fullName,
          type: cardType
      };
      
  
      //('%B6545461234613451^DOE/JOHN^21040000000000000000000?;this part does not matter')

  }

  const setSearchKeyword: any = (_searchKeyword: any) => {

    setKeyword(_searchKeyword);

    if (String(_searchKeyword).split("").length > 1) {

      let rg: any = _searchKeyword ? new RegExp(_searchKeyword, "gi") : null;

      let _products: any = [];

      if (isCategoryView) {

        _products = categoryProducts.filter((p: any) => !rg || p.product_name.match(rg));

      } else {

        _products = productsAll.filter((p: any) => !rg || p.product_name.match(rg));

      }

      setFilteredProducts(_products);

      setIsCategoryView(false);

      console.log("SEARCH", _searchKeyword, _products);

    } else {

      setIsCategoryView(true);

    }

  }

  const [activeMenu, setActiveMenu] = React.useState<any>("pos");

  const [cash, setCash] = React.useState<any>(0);

  const [change, setChange] = React.useState<any>(0);

  const [moneys] = React.useState<Array<number>>([1.00, 5.00, 10.00, 20.00, 50.00, 100.00]);

  const [cart, setCart] = React.useState<Array<any>>([]);

  const [filteredProducts, setFilteredProducts] = React.useState<Array<any>>([]);

  const [productsAll, setProductsAll] = React.useState<Array<any>>([]);

  const [categoryProducts, setCategoryProducts] = React.useState<Array<any>>([]);

  const [productCategories, setProductCategories] = React.useState<any>();

  const [isCategoryView, setIsCategoryView] = React.useState(true);

  const [currentCategory, setCurrentCategory] = React.useState<any>({
    category_id: 0,
    category_name: ""
  });

  const [customer, setCustomer] = React.useState<any>({
    customer_id: 0,
    customer_name: "Julian"
  });

  const [cashier, setCashier] = React.useState<any>({
    cashier_id: 0,
    cashier_sid: "SID.CUSR0045.2307/1.005",
    cashier_name: "Tanatswa"
  });

  const [receiptNo, setReceiptNo] = React.useState<any>(0);
  const [receiptDate, setReceiptDate] = React.useState<any>(new Date().toLocaleString().replace(',',''));
  const [taxInvNumber, setTaxInvNumber] = React.useState<any>("234782");
  const [tableNumber, setTableNumber] = React.useState<any>("MBS-UK003");
  const [referenceNumber, setReferenceNumber] = React.useState<any>("MBS.2307.0044.3.004");
  const [POSNumber, setPOSNumber] = React.useState<any>("UK001");
  const [taxPercentage, setTaxPercentage] = React.useState<any>(0.15);
  const [totalDelivery, setTotalDelivery] = React.useState<any>(0);
  const [totalDiscount, setTotalDiscount] = React.useState<any>(0);
  const [transactionReference, setTransactionReference] = React.useState<any>("MP20230934.234526.A0492");
  const [paymentMethod, setPaymentMethod] = React.useState<any>("ECOCASH");
  const [orderType, setOrderType] = React.useState<any>("****** TAKE AWAY ******");
  const [orderNumber, setOrderNumber] = React.useState("0034");
  const [isNetworkPrinter, setIsNetworkPrinter] = React.useState(true);

  const displayCategory: any = (category: any) => {

    console.log("******", category);

    let _products: any = [];

    setIsCategoryView(true);

    category.productsArray.map((product: any) : void => {
      _products.push(product);
    })

    setFilteredProducts(_products);

    setCurrentCategory(category);

    setCategoryProducts(_products);

    setIsCategoryView(false);

    console.log("FILTERED PRODUCT", _products);

  }

  const addToCart: any = (product: any) => {

    console.log("ADD PRODUCT", product);

    const index: number = findCartIndex(product);

    if (index === -1) {

      setCart(
        [
          ...cart,
          {
            id: product.product_id,
            name: product.product_name,
            image: product.image,
            price: product.gaap_forex_price,
            option: product.option,
            qty: 1,
          }
        ]);

    } else {

      const _cart:any = cart;

      _cart[index].qty += 1;

      setCart(_cart);

    }

    beep();

    updateChange();

  }

  const addQty: any = (item: any, qty: number) => {

    const _cart = cart;

    const index = _cart.findIndex((i: any) => i.id === item.id);
    if (index === -1) {
      return;
    }
    const afterAdd = item.qty + qty;
    if (afterAdd === 0) {
      _cart.splice(index, 1);
      clearSound();
    } else {
      _cart[index].qty = afterAdd;
      beep();
    }

    setCart(_cart);

    updateChange();

  }

  const findCartIndex: any = (product: any) => {

    return cart.findIndex((p: any) => p.id === product.product_id);

  }

  const [totalPrice, setTotalPrice] = React.useState<any>(0)

  const getTotalPrice: any = () => {

    const _totalPrice = cart.reduce(
      (total:number, item:any) => total + (item.qty * item.price),
      0
    );

    setTotalPrice(_totalPrice);
    setChange(cash - _totalPrice);
    console.log("TOTAL>>>", _totalPrice, change >= 0 && cart.length > 0, change, cart.length);
    return _totalPrice;

  }

  const [itemsCount, setItemsCount] = React.useState<any>(0);

  const getItemsCount: any = () => {
    const _itemsCount: number = cart.reduce((count, item) => count + item.qty, 0);
    setItemsCount(_itemsCount);
    return _itemsCount;
  }

  const updateChange: any = (_cash:number=0) => {

    if(_cash === 0){
      _cash = cash;
    }

    const _totalAmount:number = getTotalPrice();
    const _change: number = _cash - _totalAmount;
    setChange(_change);
    getItemsCount();
    submitable(_change);;
    return _change;

  }

  const updateCash: any = (e: React.ChangeEvent<HTMLInputElement>) => {

    const _number: any = e.target.value;
    const _cash: number = parseFloat(_number.replace(/[^0-9]+/g, ""));
    setCash(_cash);
    updateChange(_cash);
    setIsPaymentSet(true);
    beep();
    return _cash;

  }

  // Create our number formatter.
const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',

    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });

  const priceFormat: any = (_price: number) => {

    return _price ? currencyFormatter.format(_price) : "$0.00";

  }

  const dateFormat: any = (_date: any) => {

    const formatter = new Intl.DateTimeFormat('id', { dateStyle: 'short', timeStyle: 'short'});
    return formatter.format(_date);

  }

  const addCash: any = (amount: number) => {

    const _cash:number = (cash || 0) + amount;
    setCash(_cash)
    updateChange(_cash);
    setIsPaymentSet(true);
    beep();

  }

  const [isSubmitable, setIsSubmitable] = React.useState<boolean>(false);

  const submitable: any = (_change:number = 0) => {

    if(_change === 0){
      _change = change;
    }
    const _submitable: boolean = _change >= 0 && cart.length > 0 && isPaymentSet;
    setIsSubmitable(_submitable);
    return _submitable;

  }

  const submit: any = () => {

    const time = new Date();
    setIsShowModalReceipt(true);
    const _receiptNo: any = `MBS-UK-${Math.round(time.getTime() / 1000)}`;
    const _receiptDate: any = dateFormat(time);
    setReceiptNo(_receiptNo);
    setReceiptDate(_receiptDate);

    setTimeout(()=>{

      const receiptContent = document.getElementById('receipt-content');

      setPrintAreaInnerHTML(receiptContent?.innerHTML);
    
    },1000);

  }

  const closeModalReceipt: any = () => {

    setIsShowModalReceipt(false);

  }

  const printAndProceed: any = () => {

    const titleBefore = document.title;

    composeReceiptAndPrint();

    document.title = receiptNo;

    window.print();

    setIsShowModalReceipt(false); 

    document.title = titleBefore;

    // TODO save sale data to database
    clear();

  }

  const clear: any = () => {
    setCash(0)
    setCart([]);
    setReceiptNo("");
    setReceiptDate("");
    setIsPaymentSet(false);
    clearSound();
    setPrintAreaInnerHTML("");
    setTimeout(()=>{
      updateChange();
    },100);

    (document.getElementById('print-area') as any).innerHTML = "";

  }

  const clearSound: any = () => {
    playSound(buttonSound);
  }

  const beep: any = () => {
    playSound(beepSound);
  }

  const playSound: any = (_sound:any) => {
    const sound = new Audio();
    sound.src = _sound;
    sound.play();
    sound.onended = () => {};
  }

  const ReceiptDisplay: any = () => {
    
    const receiptObject:any = (
      <Printer type="epson" width={50} characterSet="pc437_usa">
        <Image src={mambosLogo} align="center" />
        <Text bold={true} align="center">EAT LIKE A KING</Text>
        <Text bold={true} align="center">17 Park Street, Shanda Hse, Harare CBD</Text>
        <Text bold={true} align="center">Tel: +263 (024) 2757211</Text>
        <Text bold={true} align="center">Email: info@mamboschicken.co.uk</Text>
        <Text bold={true} align="center">Web: www.mamboschicken.co.uk</Text>
        <Br />
        <Text size={{ width: 1, height: 1 }} align="center">FISCAL TAX RECEIPT</Text>
        <Text size={{ width: 2, height: 2 }}align="center">ORDER# {orderNumber}</Text>
        <Text bold={true}align="center">{orderType}</Text>
        <Br />
        <Line />
        <Row left="Date:" right={receiptDate} />
        <Row left="Receipt No:" right={receiptNo} />
        <Row left="Tax Inv No:" right={taxInvNumber} />
        <Row left="Table No:" right={tableNumber} />
        <Row left="Ref No:" right={referenceNumber} />
        <Row left="Cashier:" right={cashier.cashier_name} />
        <Row left="Customer:" right={customer.customer_name} />
        <Row left="Total Items:" right={`${itemsCount}`} />
        <Br />
        <Line />
        <Row 
          left={<Text invert={true} bold={true}>DESCRIPTION</Text>}
          right={<Text invert={true} bold={true}>AMOUNT</Text>}
        />
        <Line />

        {cart.map((item: any, index: number) => (

          <>
            <Row key={`row-${index}`}  left={`${item.qty}x ${item.name}`} right={priceFormat(item.qty * item.price)} />
            {/*<Text>- Item code: {index + 1}</Text>*/}
            <Line key={`line-${index}`}  /> 
          </>

        ))}

        <Br />
        <Row left="SUB TOTAL" right={priceFormat(totalPrice)} />
        <Row left="DELIVERY" right={priceFormat(totalDelivery)} />
        <Row left="DISCOUNT" right={priceFormat(totalDiscount)} />
        <Line />
        <Row 
          left={<Text size={{ width: 1, height: 1 }}>TOTAL</Text>}
          right={<Text size={{ width: 1, height: 1 }}>{priceFormat(totalPrice + totalDelivery - totalDiscount)}</Text>}
        />
        <Line />
        <Barcode align="center" type="UPC-A" content="111111111111" />
        <Line />
        <Row left="TENDERED:" right={priceFormat(cash)} />
        <Row left="CHANGE:" right={priceFormat(change)} />
        <Row left="TXN REF:" right={transactionReference} />
        <Row left="PAYMENT METHOD:" right={paymentMethod} />
        <Line />
        <Text size={{ width: 1, height: 1 }} align="center">VALUE ADDED TAX SUMMARY</Text>
        <Row 
          left={`NET`} 
          center={`VAT`} 
          right={`TOTAL`} 
        />
        <Row 
          left={`${priceFormat((totalPrice + totalDelivery - totalDiscount)-(totalPrice + totalDelivery - totalDiscount)*0.15)}`} 
          center={`${priceFormat((totalPrice + totalDelivery - totalDiscount)*0.15)}`}
          right={`${priceFormat(totalPrice + totalDelivery - totalDiscount)}`} 
        />
        <Line />
        <Text align="center">*** Thank you please call again ***</Text>
        <Text align="center">Scan the code below with your Mambo's App to reedem your loyalty points.</Text>
        <Br />
        <QRCode align="center" content={`${paymentMethod}|${transactionReference}|${(totalPrice + (totalPrice * taxPercentage) + totalDelivery - totalDiscount)}|${customer.uid}|${orderNumber}`} />
        <Br />
        <Cut />
        <Cashdraw pin="5pin" />
      </Printer>
    );

    return receiptObject;

  }

  const printReceipt: any = async (_receiptObject: any) => {

    const data: Uint8Array = await render(_receiptObject);

    console.log("PRINT DATA", data);

    if (isNetworkPrinter) {
      printViaIPAddress(data);
    } else {
      printViaSerialPort(data);
    }

  }

  const composeReceiptAndPrint: any = async () => {

    printReceipt(
      ReceiptDisplay()
    );

  }

  const printViaSerialPort:any = async (data:any) => {

    const port = await window.navigator.serial.requestPort();
    await port.open({ baudRate: printerSettings.serial.baudRate });

    const writer = port.writable?.getWriter();
    if (writer != null) {
      await writer.write(data);
      writer.releaseLock();
    }
    
  }

  const connect:any = (cxn:any, cb:any) => {

    cb(cxn);

  }

  const printerSettings: any = {
    wifi: {
      IPv4Address: '192.168.100.18',
      portNumber: 9100,
      timeout: 3000
    },
    serial: {
      baudRate: 9600
    }
  }

  const printViaIPAddress:any = async (data:any) => {

    const conn = connect({
      host: printerSettings.wifi.IPv4Address,
      port: printerSettings.wifi.portNumber,
      timeout: printerSettings.wifi.timeout,
    }, () => {

      console.log("BUFFER", Buffer.from(data))

      conn.write(Buffer.from(data), () => {
        conn.destroy();
      });
    });
    
  }

  React.useEffect(() => {

    const _productsData: any = productsData;

    delete _productsData["promotions"];
    delete _productsData["staff-meal"];

    const _newCategoryProducts: any = {};

    const _allProducts: any = [];

    Object.keys(_productsData).map((categoryKey: any) => {

      _newCategoryProducts[categoryKey] = _productsData[categoryKey];

      _newCategoryProducts[categoryKey]["productsArray"] = [];

      //console.log(":: CATEGORY PRODUCTS", _productsData);

      Object.keys(_productsData[categoryKey]["products"]).map((productKey: any) => {

        //console.log(":: PRODUCTS", _productsData[categoryKey]["products"][productKey]);

        _newCategoryProducts[categoryKey]["productsArray"].push(_productsData[categoryKey]["products"][productKey]);

        _allProducts.push(_productsData[categoryKey]["products"][productKey]);

      })

    });

    setProductCategories(_newCategoryProducts);

    setProductsAll(_allProducts);

    //console.log(">>> ALL PRODUCTS", _allProducts);

    //console.log(">>> CATEGORIZED PRODUCTS", _newCategoryProducts);

  }, [productsData]);

  React.useEffect(() => {

    setIsNetworkPrinter(true);

  }, []);

  React.useEffect(() => {

  }, []);

  const [activeElement, setActiveElement] = React.useState("");

  const handleClick = (value: string) => {
    if (value === activeElement) {
      setActiveElement("");
    } else {
      setActiveElement(value);
    }
  };

  return (
    <>
      {/*-- noprint-area --*/}
      <div className="hide-print flex flex-row h-screen antialiased text-blue-gray-800">
        {/*-- left sidebar --*/}
        <div className="flex flex-row w-auto flex-shrink-0 m-0 p-0">
          <div className="flex flex-col items-center py-4 flex-shrink-0 w-20 bg-red-700 ">
            <a href="#"  className="flex items-center justify-center h-12 w-12 bg-red-50 text-red-700 rounded-full">
              <img alt="" src="/assets/media/logos/logo.png" width="50px" />
            </a>
            <ul className="flex flex-col space-y-2 mt-12">
              <li>
                <a href="#"  className="flex items-center">
                  <span
                    className={`flex items-center justify-center h-12 w-12 rounded-lg ${activeMenu === 'pos' ? 'bg-red-300 shadow-lg text-white' : 'hover:bg-red-400 text-red-100'}`}

                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </span>
                </a>
              </li>
              <li>
                <a href="#"  className="flex items-center">
                  <span className="flex items-center justify-center text-red-100 hover:bg-red-400 h-12 w-12 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </span>
                </a>
              </li>
              <li>
                <a href="#"  className="flex items-center">
                  <span className="flex items-center justify-center text-red-100 hover:bg-red-400 h-12 w-12 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </span>
                </a>
              </li>
              <li>
                <a href="#"  className="flex items-center">
                  <span className="flex items-center justify-center text-red-100 hover:bg-red-400 h-12 w-12 rounded-lg">
                    <svg className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </span>
                </a>
              </li>
            </ul>
            <a href="#" 
              className="mt-auto flex items-center justify-center text-red-200 hover:text-red-100 h-10 w-10 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>

        {/*-- page content --*/}
        <div className="flex-grow flex">
          {/*-- store menu --*/}


          <div className="flex flex-col bg-blue-gray-50 h-full w-full py-4">
            <div className="flex px-2 flex-row relative" style={{ width: "100%" }}>
              <div className="absolute left-5 top-3 px-2 py-2 rounded-full bg-red-700 text-white" >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="bg-white rounded-lg shadow text-lg full w-full h-16 py-4 pl-16 transition-shadow focus:shadow-2xl focus:outline-none"
                placeholder="Products menu ..."
                value={keyword}
                onChange={(e) => { setSearchKeyword(e.target.value); }}
              />

              <button onClick={(e) => { setIsCategoryView(false); setIsCategoryView(true); setSearchKeyword(""); }} className=" bg-red-700 text-white rounded-lg shadow hover:shadow-lg focus:outline-none inline-block px-4 py-4 text-sm ml-4">
                <h3 ><strong>MENU</strong></h3>
              </button>

            </div>

            {isCategoryView ? (

              <div className="px-2 py-4 grid grid-cols-5 gap-4 mt-2">

                {typeof productCategories === "object" && "addons" in productCategories && Object.keys(productCategories).map((categoryKey: any, categoryKeyIndex: number) => (

                  <button key={categoryKeyIndex} onClick={(e) => { displayCategory(productCategories[categoryKey]) }} className="bg-white rounded-lg shadow hover:shadow-lg focus:outline-none inline-block px-2 py-4 text-sm">
                    <img alt="" className="py-1" src={`/assets/media/icons/${productCategories[categoryKey].category_id}.png`} style={{ margin: "auto", width: "65%" }} />
                    <h3 ><strong>{productCategories[categoryKey].category_name}</strong></h3>
                  </button>

                ))}

              </div>

            ) : (

              <div className="h-full overflow-hidden mt-4">
                <div className="h-full overflow-y-auto px-2">

                  {productCategories.length === 0 ? (
                    <div
                      className="select-none bg-blue-gray-100 rounded-lg flex flex-wrap content-center justify-center h-full opacity-25">
                      <div className="w-full text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                        <p className="text-xl">
                          YOU DON'T HAVE
                          <br />
                          ANY PRODUCTS TO SHOW
                        </p>
                      </div>
                    </div>

                  ) : (

                    <>

                      {filteredProducts.length === 0 && keyword.length > 0 ? (
                        <div
                          className="select-none bg-blue-gray-100 rounded-lg flex flex-wrap content-center justify-center h-full opacity-25" >
                          <div className="w-full text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p className="text-xl">
                              EMPTY SEARCH RESULT
                              <br />
                              "<span className="font-semibold">{keyword}</span>"
                            </p>
                          </div>
                        </div>

                      ) : (

                        <>

                          <h2 className="py-2" style={{ fontSize: "24px", fontWeight: "600" }}>{currentCategory.category_name}</h2>

                          <div className="grid grid-cols-4 gap-4 pb-3">
                            {filteredProducts.map((product: any, productIndex: number) => (
                              <div
                                key={productIndex}
                                role="button"
                                className="select-none cursor-pointer transition-shadow overflow-hidden rounded-lg bg-white shadow hover:shadow-lg"
                                title={product.product_name}
                                onClick={(e) => { addToCart(product) }}
                              >
                                <img
                                  className="product-image"
                                  onError={({ currentTarget }) => {
                                    currentTarget.onerror = null; // prevents looping
                                    currentTarget.src=noIMG;
                                    currentTarget.className="product-image error";
                                  }}
                                  src={`https://app.mamboschicken.com/uploads/products/food-1024/${product.product_code_old}.jpg`} alt={product.product_name} />
                                <div className="flex py-2 px-3 text-sm ">
                                  <p className="flex-grow truncate mr-1" >
                                    {product.product_name}
                                  </p>
                                </div>
                                <div className="flex pt-1 pb-3 px-3 text-sm ">
                                  <p className="flex-grow truncate mr-1" >
                                    USD
                                  </p>
                                  <p className="nowrap font-semibold" >
                                    {priceFormat(product.gaap_forex_price)}
                                  </p>
                                </div>
                              </div>

                            ))}
                          </div>
                        </>

                      )}
                    </>
                  )}
                </div>
              </div>

            )}


          </div>
          {/*-- end of store menu --*/}



          {/*-- right sidebar --*/}
          <div className="w-5/12 flex flex-col bg-blue-gray-50 h-full bg-white pr-4 pl-2 py-4">
            <div className="bg-white rounded-lg flex flex-col h-full shadow">
              {/*-- empty cart --*/}
              {cart.length === 0 && (
              <div className="flex-1 w-full p-4 opacity-25 select-none flex flex-col flex-wrap content-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>
                  CART EMPTY
                </p>
              </div>
              )}
              {/*-- cart items --*/}
              {cart.length > 0 && (
              <div className="flex-1 flex flex-col overflow-auto">
                <div className="h-16 text-center flex justify-center">
                  <div className="pl-8 text-left text-lg py-4 relative">
                    {/*-- cart icon --*/}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {itemsCount>0 &&(
                      <div className="text-center absolute bg-red-700 text-white w-5 h-5 text-xs p-0 leading-5 rounded-full -right-2 top-3">{itemsCount}</div>
                    )}
                    </div>
                  <div className="flex-grow px-8 text-right text-lg py-4 relative">
                    {/*-- trash button --*/}
                    <button onClick={(e) => { clear() }} className="text-blue-gray-300 hover:text-pink-500 focus:outline-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex-1 w-full px-4 overflow-auto">
                  {cart.map((item: any, itemId: number) => (
                    <div key={itemId} className="select-none mb-3 bg-blue-gray-50 rounded-lg w-full text-blue-gray-700 py-2 px-2 flex justify-center">
                      <img src={item.image} alt="" className="rounded-lg h-10 w-10 bg-white shadow mr-2" />
                      <div className="flex-grow">
                        <h5 className="text-sm" >
                          {item.name}
                        </h5>
                        <p className="text-xs block">
                        {priceFormat(item.price)}
                        </p>
                      </div>
                      <div className="py-1">
                        <div className="w-28 grid grid-cols-3 gap-2 ml-2">
                          <button onClick={(e) => { addQty(item, -1) }} className="rounded-lg text-center py-1 text-white bg-blue-gray-600 hover:bg-blue-gray-700 focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-3 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                            </svg>
                          </button>
                          <input value={item.qty} type="text" className="bg-white rounded-lg text-center shadow focus:outline-none focus:shadow-lg text-sm" />
                          <button onClick={(e) => { addQty(item, 1) }} className="rounded-lg text-center py-1 text-white bg-blue-gray-600 hover:bg-blue-gray-700 focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-3 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}
              {/*-- end of cart items --*/}

              {/*-- payment info --*/}
              <div className="select-none h-auto w-full text-center pt-3 pb-4 px-4">
                <div className="flex mb-3 text-lg font-semibold text-blue-gray-700">
                  <div>TOTAL</div>
                  <div className="text-right w-full" >
                    {priceFormat(totalPrice)}
                  </div>
                </div>
                <div className="mb-3 text-blue-gray-700 px-3 pt-2 pb-3 rounded-lg bg-blue-gray-50">
                  <div className="flex text-lg font-semibold">
                    <div className="flex-grow text-left">CASH</div>
                    <div className="flex text-right">
                      <div className="mr-2">$</div>
                      <input value={cash} onChange={updateCash} type="text" className="w-28 text-right bg-white shadow rounded-lg focus:bg-white focus:shadow-lg px-2 focus:outline-none" />
                    </div>
                  </div>
                  <hr className="my-2" />
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {moneys.map((money: number, moneyIndex: number) => (
                      <button
                        key={moneyIndex}
                        onClick={(e) => { addCash(money) }}
                        className="bg-white rounded-lg shadow hover:shadow-lg focus:outline-none inline-block px-2 py-1 text-sm">
                        +<span>{priceFormat(money)}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {change === 0 && cart.length > 0 ? (
                <div className="flex justify-center mb-3 text-lg font-semibold bg-cyan-50 text-cyan-700 rounded-lg py-2 px-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
                ):(
                  <div className={`flex mb-3 text-lg font-semibold ${change > 0 ?'bg-cyan-50 text-blue-gray-700':'bg-red-50 text-blue-gray-700'}  rounded-lg py-2 px-3`}
                  >
                    <div className={change > 0 ?'text-cyan-800':'text-red-800'}>CHANGE</div>
                    <div className={change > 0 ?'text-right flex-grow text-cyan-600':'text-right flex-grow text-red-600'} >
                      {priceFormat(change)}
                    </div>
                  </div>
                )}
                <div className="flex-btns">

                  {/* 
                  <button
                    className={`text-white rounded-lg text-lg w-full py-3 focus:outline-none font-semibold ${totalPrice ? 'bg-orange-400 hover:bg-orange-400' : 'bg-blue-gray-200'}`}
                    disabled={totalPrice < 0}
                    onClick={(e) => { openPaymentModal(); }}
                  >
                    PAYMENT OPTIONS
                  </button>
                  */}
                  
                  <button
                    className={`text-white rounded-lg text-lg w-full py-3 focus:outline-none font-semibold ${isSubmitable ? 'bg-red-700 hover:bg-red-600' : 'bg-blue-gray-200'}`}
                    disabled={!isSubmitable}
                    onClick={(e) => { submit(); }}
                  >
                    SUBMIT
                  </button>

                </div>
              </div>
              {/*-- end of payment info --*/}
            </div>
          </div>
          {/*-- end of right sidebar --*/}
        </div>


        {/*-- modal receipt --*/}
        {isShowModalReceipt && (
          <div className="fixed w-full h-screen left-0 top-0 z-10 flex flex-wrap justify-center content-center p-24"
          >
            <div className="fixed glass w-full h-screen left-0 top-0 z-0" onClick={(e) => { closeModalReceipt() }}
              x-transitions={`
                x-transition:enter="transition ease-out duration-100"
                x-transition:enter-start="opacity-0"
                x-transition:enter-end="opacity-100"
                x-transition:leave="transition ease-in duration-100"
                x-transition:leave-start="opacity-100"
                x-transition:leave-end="opacity-0"
              `}
            ></div>
            <div className="w-96 rounded-lg bg-white shadow-xl overflow-hidden z-10"
              x-transitions={`
                x-transition:enter="transition ease-out duration-100"
                x-transition:enter-start="opacity-0 transform scale-90"
                x-transition:enter-end="opacity-100 transform scale-100"
                x-transition:leave="transition ease-in duration-100"
                x-transition:leave-start="opacity-100 transform scale-100"
                x-transition:leave-end="opacity-0 transform scale-90"
              `}
            >
              <div id="receipt-content" className="text-left w-full text-sm p-6 overflow-auto">

                <ReceiptDisplay />

              </div>
              <div className="p-4 w-full">
                <button className="bg-red-700 text-white text-lg px-4 py-3 rounded-lg w-full focus:outline-none" onClick={(e) => { printAndProceed() }}>PROCEED</button>
              </div>
            </div>

          </div>
        )}
      </div>
      {/*-- end of noprint-area --*/}

      <div id="print-area" className="print-area" dangerouslySetInnerHTML={{__html: printAreaInnerHTML}}></div>

      <Modal
        isOpen={paymentModalIsOpen}
        onAfterOpen={afterOpenPaymentModal}
        onRequestClose={closePaymentModal}
        style={paymentModalCustomStyles}
        contentLabel="Example Modal"
      >
        <div className="modal-title">
          <h2 >Select Payment Method</h2>
          <button onClick={closePaymentModal}>close</button>
        </div>
        <div>
        <div id="accordionExample">
        <div className="rounded-t-lg border border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-800">
          <h2 className="mb-0" id="headingOne">
            <button
              className={`${
                activeElement === "element1" &&
                `text-primary [box-shadow:inset_0_-1px_0_rgba(229,231,235)] dark:!text-primary-400 dark:[box-shadow:inset_0_-1px_0_rgba(75,85,99)]`
              } group relative flex w-full items-center rounded-t-[15px] border-0 bg-white px-5 py-4 text-left text-base text-neutral-800 transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none dark:bg-neutral-800 dark:text-white`}
              type="button"
              onClick={() => handleClick("element1")}
              aria-expanded="true"
              aria-controls="collapseOne"
            >
              Accordion Item #1
              <span
                className={`${
                  activeElement === "element1"
                    ? `rotate-[-180deg] -mr-1`
                    : `rotate-0 fill-[#212529]  dark:fill-white`
                } ml-auto h-5 w-5 shrink-0 fill-[#336dec] transition-transform duration-200 ease-in-out motion-reduce:transition-none dark:fill-blue-300`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </span>
            </button>
          </h2>
          <TECollapse
            show={activeElement === "element1"}
            className="!mt-0 !rounded-b-none !shadow-none"
          >
            <div className="px-5 py-4">
              <strong>This is the first item's accordion body.</strong> Lorem
              ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eu
              rhoncus purus, vitae tincidunt nibh. Vivamus elementum egestas
              ligula in varius. Proin ac erat pretium, ultricies leo at, cursus
              ante. Pellentesque at odio euismod, mattis urna ac, accumsan
              metus. Nam nisi leo, malesuada vitae pretium et, laoreet at lorem.
              Curabitur non sollicitudin neque.
            </div>
          </TECollapse>
        </div>
      </div>
      <div className="border border-t-0 border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-800">
        <h2 className="mb-0" id="headingTwo">
          <button
            className={`${
              activeElement === "element2"
                ? `text-primary [box-shadow:inset_0_-1px_0_rgba(229,231,235)] dark:!text-primary-400 dark:[box-shadow:inset_0_-1px_0_rgba(75,85,99)]`
                : `transition-none rounded-b-[15px]`
            } group relative flex w-full items-center rounded-t-[15px] border-0 bg-white px-5 py-4 text-left text-base text-neutral-800 transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none dark:bg-neutral-800 dark:text-white`}
            type="button"
            onClick={() => handleClick("element2")}
            aria-expanded="true"
            aria-controls="collapseOne"
          >
            Accordion Item #2
            <span
              className={`${
                activeElement === "element2"
                  ? `rotate-[-180deg] -mr-1`
                  : `rotate-0 fill-[#212529] dark:fill-white`
              } ml-auto h-5 w-5 shrink-0 fill-[#336dec] transition-transform duration-200 ease-in-out motion-reduce:transition-none dark:fill-blue-300`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </span>
          </button>
        </h2>
        <TECollapse
          show={activeElement === "element2"}
          className="!mt-0 !rounded-b-none !shadow-none"
        >
          <div className="px-5 py-4">
            <strong>This is the second item's accordion body.</strong> Lorem
            ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eu
            rhoncus purus, vitae tincidunt nibh. Vivamus elementum egestas
            ligula in varius. Proin ac erat pretium, ultricies leo at, cursus
            ante. Pellentesque at odio euismod, mattis urna ac, accumsan metus.
            Nam nisi leo, malesuada vitae pretium et, laoreet at lorem.
            Curabitur non sollicitudin neque.This is the second item's accordion bsdstrong  Lorem
            ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eu
            rhoncus purus, vitae tincidunt nibh. Vivamus elementum egestas
            ligula in varius. Proin ac erat pretium, ultricies leo at, cursus
            ante. Pellentesque at odio euismod, mattis urna ac, accumsan metus.
            Nam nisi leo, malesuada vitae pretium et, laoreet at lorem.
            Curabitur non sollicitudin neque.This is the second item's accordion bodsdsdstrong orem
            ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eu
            rhoncus purus, vitae tincidunt nibh. Vivamus elementum egestas
            ligula in varius. Proin ac erat pretium, ultricies leo at, cursus
            ante. Pellentesque at odio euismod, mattis urna ac, accumsan metus.
            Nam nisi leo, malesuada vitae pretium et, laoreet at lorem.
            Curabitur non sollicitudin neque.This is the secondricies leo at, cursus
            ante. Pellentesque at odio euismod, mattis urna ac, accumsan metus.
            Nam nisi leo, malesuada vitae pretium et, laoreet at lorem.
            Curabitur non sollicitudin neque.This is the second item's accordion bodsdsdstrong orem
            ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eu
            rhoncus purus, vitae tincidunt nibh. Vivamus elementum egestas
            ligula in varius. Proin ac erat pretium, ultricies leo at, cursus
            ante. Pellentesque at odio euismod, mattis urna ac, accumsan metus.
            Nam nisi leo, malesuada vitae pretium et, laoreet at lorem.
            Curabitur non sollicitudin neque.This is the secondricies leo at, cursus
            ante. Pellentesque at odio euismod, mattis urna ac, accumsan metus.
            Nam nisi leo, malesuada vitae pretium et, laoreet at lorem.
            Curabitur non sollicitudin neque.This is the second item's accordion bodsdsdstrong orem
            ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eu
            rhoncus purus, vitae tincidunt nibh. Vivamus elementum egestas
            ligula in varius. Proin ac erat pretium, ultricies leo at, cursus
            ante. Pellentesque at odio euismod, mattis urna ac, accumsan metus.
            Nam nisi leo, malesuada vitae pretium et, laoreet at lorem.
            Curabitur non sollicitudin neque.This is the second item's accordion body. dsdtrong Lorem
            ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eu
            rhoncus purus, vitae tincidunt nibh. Vivamus elementum egestas
            ligula in varius. Proin ac erat pretium, ultricies leo at, cursus
            ante. Pellentesque at odio euismod, mattis urna ac, accumsan metus.
            Nam nisi leo, malesuada vitae pretium et, laoreet at lorem.
            Curabitur non sollicitudin neque.
          </div>
        </TECollapse>
      </div>
      <div className="rounded-b-lg border border-t-0 border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-800">
        <h2 className="accordion-header mb-0" id="headingThree">
          <button
            className={`${
              activeElement === "element3"
                ? `text-primary [box-shadow:inset_0_-1px_0_rgba(229,231,235)] dark:!text-primary-400 dark:[box-shadow:inset_0_-1px_0_rgba(75,85,99)]`
                : `transition-none rounded-b-[15px]`
            } group relative flex w-full items-center rounded-t-[15px] border-0 bg-white px-5 py-4 text-left text-base text-neutral-800 transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none dark:bg-neutral-800 dark:text-white`}
            type="button"
            onClick={() => handleClick("element3")}
            aria-expanded="true"
            aria-controls="collapseOne"
          >
            Accordion Item #3
            <span
              className={`${
                activeElement === "element3"
                  ? `rotate-[-180deg] -mr-1`
                  : `rotate-0 fill-[#212529] dark:fill-white`
              } ml-auto h-5 w-5 shrink-0 fill-[#336dec] transition-transform duration-200 ease-in-out motion-reduce:transition-none dark:fill-blue-300`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </span>
          </button>
        </h2>
        <TECollapse
          show={activeElement === "element3"}
          className="!mt-0 !shadow-none"
        >
          <div className="px-5 py-4">
            <strong>This is the third item's accordion body.</strong>Lorem ipsum
            dolor sit amet, consectetur adipiscing elit. Vestibulum eu rhoncus
            purus, vitae tincidunt nibh. Vivamus elementum egestas ligula in
            varius. Proin ac erat pretium, ultricies leo at, cursus ante.
            Pellentesque at odio euismod, mattis urna ac, accumsan metus. Nam
            nisi leo, malesuada vitae pretium et, laoreet at lorem. Curabitur
            non sollicitudin neque.
          </div>
        </TECollapse>
      </div>
        </div>
      </Modal>

    </>
  )
};
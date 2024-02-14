import { useState } from 'react';
import './feeCalculator.css'
import { format } from 'date-fns';

interface CalValues {
  cartValue: number;
  deliveryDistance: number;
  itemAmount: number;
  purchaseDate: Date;
}

export default function FeeCalculator() {
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0)
  const [freeDelivey,setFreeDelivery]=useState<boolean>(false)
  const [showCharge,setShowCharge]=useState<boolean>(false)

  const [calValues, setCalValues] = useState<CalValues>({
    cartValue: 0.0,
    deliveryDistance: 0,
    itemAmount: 0,
    purchaseDate: new Date(),
  })



  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const name: string = e.target.name;
    const value: string = e.target.value;
  
    setCalValues((prevCalValues: CalValues) => {
      if (name === "cartValue" || name === "deliveryDistance" || name === "itemAmount") {
        return { ...prevCalValues, [name]: parseFloat(value) || 0 };
      } else if (name === "purchaseDate") {
        const inputDate = new Date(value);
        const formattedDate = !isNaN(inputDate.getTime()) ? inputDate : prevCalValues.purchaseDate;
        return { ...prevCalValues, [name]: formattedDate };
      } else {
        return { ...prevCalValues, [name]: value };
      }
    });
  };


  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>):void => {
    e.preventDefault()
    let chargeForDelivery: number = 0
    let surCharge: number = 0
    let distanceCharge: number = 0
    // checking first condition to charge if cartvalue is less than 10 euro
    if (calValues.cartValue < 10) {
      surCharge = 10 - calValues.cartValue
      // console.log(surCharge)
    }
    if(calValues.deliveryDistance<=1000){
      // basic charge for delivery up to 1000 
      distanceCharge=2 
      console.log(distanceCharge,"basic")
    }
    else {
      // basic charge for delivery up to 1000  2 euro
        distanceCharge=2
        // taking out charged meters
      let extraMeters:number=calValues.deliveryDistance-1000
        // per extra 500 meter is 1 euro and even for less than 500 is also euro
        // so
        if(extraMeters>0){
          // making units of 500 to calculate 
          let meterUnits=extraMeters/500
          // floor number of meter units without decimals  will be added as euro as 1 unit AS 1 EURO  means 500 ,3 unit AS 3 EURO means 1500
          distanceCharge+=Math.floor(meterUnits)
          // for meters that are not exactly 500 but less such as .3 or 0.5 1 euro is also added
            // TAKING DEcimals out for eg 1.60-1=0.60
          let decimalMeterUnits= meterUnits-Math.floor(meterUnits)
             if(decimalMeterUnits>0){
              distanceCharge+=1
             }


        }
            
      
       console.log(distanceCharge)

    }
    
    

    if (calValues.itemAmount > 4 && calValues.itemAmount <= 12) {
      surCharge += (calValues.itemAmount - 4) * 0.50
    }
    else if (calValues.itemAmount > 4 && calValues.itemAmount > 12) {
      surCharge += ((calValues.itemAmount - 4) * 0.50) + 1.20
    }
    console.log("surcharge", surCharge)
    console.log(distanceCharge,"distance")

    chargeForDelivery = distanceCharge + surCharge;




    let productDatePurchase: Date = new Date(calValues.purchaseDate)
    let dayOfPurchase: number = productDatePurchase.getDay()
    let hourOfPurchase: number = productDatePurchase.getUTCHours()
    let minuteOfPurchase: number = productDatePurchase.getUTCMinutes()

    // console.log(dayOfPurchase, hourOfPurchase, minuteOfPurchase)
    // days start form sunday as 0 , 1 monday and so on till friday is 5
    // checking friday using 5
    if (dayOfPurchase === 5) {
      //  checking if it is 3-7pm
      if ((hourOfPurchase >= 15 && (hourOfPurchase < 19 && minuteOfPurchase <= 59)) || (hourOfPurchase > 15 && (hourOfPurchase === 19 && minuteOfPurchase === 0))) {

        chargeForDelivery *= 1.20
      }

    }
    //  checking if it is more than max price
    if (chargeForDelivery > 15) {
      chargeForDelivery = 15
    }
    // checking for free delivery above 200 cart value
    if (calValues.cartValue >= 200) {
      chargeForDelivery = 0
      setFreeDelivery(true)
      setShowCharge(false)
    }
    
     
    setDeliveryCharge(Number(chargeForDelivery.toFixed(2)))
    if(chargeForDelivery>0){
      setShowCharge(true)
      setFreeDelivery(false)
    }

    // console.log("the delivery charge will be",chargeForDelivery)


  }

  return (
    <div id="cart-calculator-container">
      <span id="text-top-cal">Delivery Charge Calculator</span>
      <div id="cal-form-container">
        <form id="form-calculator" onSubmit={ handleFormSubmit }>

          <div className="input-container">

            <label className="input-label cart-label" htmlFor="cartValue">Cart Value  </label>
            <input type="number" required id="cartValue" onChange={ handleFormChange } step="any" data-test-id="cartValue" name="cartValue" />

          </div>
          {/* <span id="symbol-Euro">&#8364</span>  */ }

          <div className="input-container">

            <label className="input-label" htmlFor="deliveryDistance">Delivery distance  </label>
            <input type="number" required id="deliveryDistance" onChange={ handleFormChange }   data-test-id="deliveryDistance" name="deliveryDistance" />
          </div>
          {/* <span id="meters-distance">meters</span> */ }

          <div className="input-container">

            <label className="input-label" htmlFor="itemAmount">Number of Items </label>
            <input type="number" required id="itemAmount" onChange={ handleFormChange } data-test-id="itemAmount"  name="itemAmount" />

          </div>
          <div className="input-container">

            <label className="input-label" htmlFor="purchaseDate">Date of purchase</label>
            <input type="datetime-local" required id="purchaseDate" onChange={ handleFormChange } data-test-id="purchaseDate"  value={calValues.purchaseDate.toISOString().slice(0,-8)} name="purchaseDate" />
          </div>


          <button type="submit" id="Calculate-price" >Calculate Delivery Charge</button>



        </form>

         {   showCharge && <div className="Delivery-price-calculated-container">
          
          <span >Delivery Charge is : {deliveryCharge} </span><i className="fa-solid fa-euro-sign"></i>

        </div>}
        { freeDelivey && <div className="Delivery-price-calculated-container">
          
          <span >Delivery  is Free</span>

        </div>}




      </div>



    </div>
  )
}

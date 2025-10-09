import { Plus } from "lucide-react";
import "../css/coupons.css"
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Select ,
  MenuItem
} from "@mui/material";

function Coupons() {
  const [coupons, setCoupons] = useState([{
    code: "coupon1",
    type: "percentage",
    value: 10
  }, {
    code: "coupon2",
    type: "cash",
    value: 50
  }, {
    code: "coupon3",
    type: "percentage",
    value: 20
  }]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState("");
  const [value, setValue] = useState();

  // async function fetchCoupons() {}

  // useEffect(() => {
  //   const coupons = fetchCoupons();
  //   setCoupons(coupons);
  // }, []);

  async function handleDelete(coupon) {
    const newCoupons = coupons.filter((c) => c.code !== coupon.code);
    setCoupons(newCoupons);
    // try {
    //   const response = await fetch("/api/coupons", {
    //     method: "DELETE",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(coupon)
    //   })
    // } catch (error) {
    //   console.log(error);
    // }
  }

  async function handleSave() {
    try {
      const newCoupons = [...coupons, {code, type, value}];
      setCoupons(newCoupons);
      // const response = await fetch("/api/coupons", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({code, type, value})
      // })
    } catch (error) {
      console.log(error);
    }
    setDialogOpen(false);

  }
  return (
    <>
      <div>
        <div className="coupons-page-header">
          <h1>COUPONS</h1>
          <button onClick={() => setDialogOpen(true)}><Plus /> ADD</button>
        </div>
        <div className="coupons-page-coupons-container">
          {
            coupons.map((coupon, index) => {
              return (
                <div key={index} className="coupons-page-coupons-container-item">
                  <h2>{coupon.code}</h2>
                  <div>
                    <h4>{`${coupon.value} ${(coupon.type === "percentage" ? "%" : "Rupees")} off`}</h4>
                    <button onClick={()=>handleDelete(coupon)}>Delete</button>
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>ADD COUPON</DialogTitle>
        <DialogContent className="coupons-page-coupons-dialog-content" dividers>
          <TextField label="Code" onChange={(e) => setCode(e.target.value)}/>
          <TextField label="Type" select onChange={(e) => setType(e.target.value)}>
            <MenuItem value={"percentage"}>Percentage</MenuItem>
            <MenuItem value={"cash"}>Cash</MenuItem>
          </TextField>
          <TextField label="Value" onChange={(e) => setValue(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={()=>handleSave()}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Coupons;
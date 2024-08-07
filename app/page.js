"use client";
import {firestore} from "@/firebase";
import {Box, Button, Fab, Modal, Stack, TextField, Typography} from "@mui/material";
import {collection, deleteDoc, doc, getDoc, getDocs, query, setDoc} from "firebase/firestore";
import {useEffect, useState} from "react";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, {tableCellClasses} from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import {styled} from '@mui/material/styles';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90vw',
    maxWidth: 400,
    bgcolor: 'background.paper',
    color: 'black',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
};

const StyledTableCell = styled(TableCell)(({theme}) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.white,
        color: '#303030',
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        color: theme.palette.common.white,  // Ensure text color is white for better contrast
    },
}));

const StyledTableRow = styled(TableRow)(({theme}) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: '#1E1E1E',
        color: theme.palette.common.white,
    },
    '&:nth-of-type(even)': {
        backgroundColor: '#303030',
        color: theme.palette.common.white,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export default function Home() {
    const [pantry, setPantry] = useState([]);
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [itemName, setItemName] = useState("");
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name');


    const updatePantry = async () => {
        const snapshot = query(collection(firestore, 'pantry'));
        const docs = await getDocs(snapshot);
        const pantryList = [];
        docs.forEach((doc) => {
            pantryList.push({name: doc.id, ...doc.data()});
        });
        setPantry(pantryList);
    };

    useEffect(() => {
        updatePantry();
    }, []);

    const addItem = async (item) => {
        const docRef = doc(collection(firestore, 'pantry'), item);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
            const {count} = docSnapshot.data();
            await setDoc(docRef, {count: count + 1});
            await updatePantry();
        } else {
            await setDoc(docRef, {count: 1});
            updatePantry();
        }
    };

    const removeItem = async (item) => {
        const docRef = doc(collection(firestore, 'pantry'), item);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
            const {count} = docSnapshot.data();
            if (count === 1) {
                await deleteDoc(docRef);
            } else {
                await setDoc(docRef, {count: count - 1});
            }
            await updatePantry();
        }
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedPantry = [...pantry].sort((a, b) => {
        if (orderBy === 'name') {
            return order === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        } else if (orderBy === 'count') {
            return order === 'asc' ? a.count - b.count : b.count - a.count;
        }
        return 0;
    });


    return (
        <Box
            width="100vw"
            height="100vh"
            display="flex"
            justifyContent="center"
            flexDirection="column"
            alignItems="center"
            backgroundColor="white"
            gap={2}
        >
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Add Item
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            id="outlined-basic"
                            label="Item"
                            variant="outlined"
                            fullWidth
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                        />
                        <Button variant="outlined" onClick={() => {
                            addItem(itemName);
                            setItemName('');
                            handleClose();
                        }}>Add</Button>
                    </Stack>
                </Box>
            </Modal>

            <Box
                border="1px solid black"
                width="90%"
                maxWidth="800px"
                margin="auto"
                display="flex"
                flexDirection="column"
                position="relative" // Ensure the container is positioned relatively for absolute positioning of children
            >
                <Box
                    width="100%"
                    height="100px"
                    bgcolor="#ADD8E6"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    position="relative" // Position relative for the absolute positioning of the Fab button
                >
                    <Typography
                        variant="h3"
                        color="#333"
                        textAlign="center"
                        fontWeight="300"
                        flex="1" // Allow Typography to take up space and push other content to the right
                    >
                        Pantry Items
                    </Typography>
                    {/*<Box*/}
                    {/*    position="absolute"*/}
                    {/*    right={16}*/}
                    {/*    top="50%"*/}
                    {/*    sx={{transform: 'translateY(-50%)'}}*/}
                    {/*>*/}
                    {/*    <Fab*/}
                    {/*        color="primary"*/}
                    {/*        aria-label="add"*/}
                    {/*        onClick={handleOpen}*/}
                    {/*    >*/}
                    {/*        <AddIcon/>*/}
                    {/*    </Fab>*/}
                    {/*</Box>*/}
                </Box>
                <TableContainer component={Paper} sx={{maxHeight: 300, overflowX: 'auto'}}>
                    <Table sx={{minWidth: 700}} aria-label="pantry table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell sortDirection={orderBy === 'name' ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === 'name'}
                                        direction={orderBy === 'name' ? order : 'asc'}
                                        onClick={() => handleRequestSort('name')}
                                    >
                                        Name
                                    </TableSortLabel>
                                </StyledTableCell>
                                <StyledTableCell align="center" sortDirection={orderBy === 'count' ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === 'count'}
                                        direction={orderBy === 'count' ? order : 'asc'}
                                        onClick={() => handleRequestSort('count')}
                                    >
                                        Quantity
                                    </TableSortLabel>
                                </StyledTableCell>
                                <StyledTableCell align="right">Action</StyledTableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {sortedPantry.map(({name, count}) => (
                                <StyledTableRow key={name}>
                                    <StyledTableCell component="th" scope="row">
                                        <Typography variant="h4">
                                            {name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}
                                        </Typography>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <Typography variant="h5">{count}</Typography>
                                    </StyledTableCell>
                                    <StyledTableCell align="right">
                                        <Button
                                            variant="contained"
                                            onClick={() => {
                                                removeItem(name);
                                                setItemName('');
                                                handleClose();
                                            }}
                                            startIcon={<DeleteIcon/>}
                                        >
                                            Remove
                                        </Button>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>

                    </Table>
                </TableContainer>


            </Box>


            <Fab
                variant="extended"
                color="primary"
                aria-label="add"
                onClick={handleOpen}
                sx={{
                    position: 'absolute',
                    bottom: 12,

                    boxShadow: 3
                }}
            >
                <AddIcon/>
                Add Item
            </Fab>

        </Box>
    );
}

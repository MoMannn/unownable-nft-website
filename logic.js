let provider = null;
const nftAddress = "0x911B67ef816E6434781f101e6a52aC52fe9aC192";
const chainId = "0x89"; // polygon mainnet
let wallet = null;

$(function () {
  setInterval(checkPossesion, 5000);
});

async function checkPossesion() {
  if (provider) {
    await loadNFT();
  }
}

async function connect() {
  let currentChain = null;
  $("#connectError").html("");

  try {
    initProvider();
    currentChain = await getCurrentChain();
  } catch (e) {
    $("#connectError").html("Metamask not supported");
    return;
  }

  if (currentChain != chainId) {
    try {
      await switchChain();
      initProvider();
      currentChain = await getCurrentChain();
    } catch (e) {
      try {
        await addChain();
      } catch (e) {
        $("#connectError").html("Metamask not supported");
        return;
      }
    }
  }

  await ethereum.request({ method: "eth_requestAccounts" });
  wallet = await provider.getSigner().getAddress();

  $("#connect").html(`<p>${wallet}</p>`);

  await loadNFT();
}

async function switchChain() {
  await ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId }],
  });
}

async function addChain() {
  await ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId,
        rpcUrls: ["https://polygon-rpc.com/", "https://polygon.llamarpc.com/"],
        chainName: "Polygon Mainnet",
        nativeCurrency: {
          name: "MATIC",
          symbol: "MATIC",
          decimals: 18,
        },
        blockExplorerUrls: ["https://polygonscan.com/"],
      },
    ],
  });
}

async function getCurrentChain() {
  return ethereum.request({ method: "eth_chainId" });
}

async function initProvider() {
  provider = new ethers.providers.Web3Provider(window.ethereum, "any");
}

async function loadNFT() {
  try {
    const contract = new ethers.Contract(nftAddress, nftAbi, provider);
    const owner = await contract.ownerOf(1);
    if (wallet && owner == wallet) {
      $("#nftInfo").html(
        `Unownable token is currently in <b class="text-link">your possession</b>!`
      );
      $("#btnTakePossession").prop("disabled", true);
    } else {
      $("#nftInfo").html(
        `<p>Currently in possession of:</p><p class="text-link">${owner}</p>`
      );
      $("#btnTakePossession").prop("disabled", false);
    }
  } catch (e) {
    console.log(e);
  }
}

async function takePossession() {
  if (!provider) {
    await connect();
  }
  const nft = new ethers.Contract(nftAddress, nftAbi, provider).connect(
    provider.getSigner()
  );
  const tx = await nft.takePossession();
  // $("#nftInfo").html(
  //   `<p>Transaction in progress:</p><a target="_blank" href=${tx}>See on polygonscan</a>`
  // );
}

function donate() {
  window.open(
    "https://commerce.coinbase.com/checkout/3d7903bb-85ef-4839-af92-d2fd4cc16ab3",
    "_blank"
  );
}

function readWhitepaper() {
  window.open("https://themihaartnak.com/last", "_blank");
}

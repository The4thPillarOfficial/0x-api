import * as express from 'express';
import * as asyncHandler from 'express-async-handler';

import { MetaTransactionHandlers } from '../handlers/meta_transaction_handlers';
import { MetaTransactionService } from '../services/meta_transaction_service';
import { SwapVersion } from '../types';
import { MetaTransactionRateLimiter } from '../utils/rate-limiters';

export const createMetaTransactionRouter = (
    metaTransactionService: MetaTransactionService,
    rateLimiter?: MetaTransactionRateLimiter,
): express.Router => {
    const router = express.Router();
    const handlers = new MetaTransactionHandlers(metaTransactionService, rateLimiter);
    router.get('/', asyncHandler(MetaTransactionHandlers.rootAsync.bind(MetaTransactionHandlers)));
    /**
     * GET price endpoint returns the price the taker can expect to receive by
     * calling /quote
     */
    router.get('/price', asyncHandler(handlers.getPriceAsync.bind(handlers, SwapVersion.V0)));
    /**
     * GET quote endpoint returns an unsigned 0x Transaction that when sent to
     * `executeTransaction` will execute a specified swap.
     *
     * https://0x.org/docs/guides/v3-specification#transaction-message-format
     */
    router.get('/quote', asyncHandler(handlers.getQuoteAsync.bind(handlers, SwapVersion.V0)));
    /**
     * GET status endpoint retrieves the transaction status by its hash.
     */
    router.get('/status/:txHash', asyncHandler(handlers.getTransactionStatusAsync.bind(handlers)));
    /**
     * POST Transaction endpoint takes a signed 0x Transaction and sends it to Ethereum
     * for execution via `executeTransaction`.
     *
     * https://0x.org/docs/guides/v3-specification#executing-a-transaction
     */
    router.post('/submit', asyncHandler(handlers.submitTransactionIfWhitelistedAsync.bind(handlers)));
    router.get('/signer/status', asyncHandler(handlers.getSignerStatusAsync.bind(handlers)));

    router.get('/v1', asyncHandler(MetaTransactionHandlers.rootAsync.bind(MetaTransactionHandlers)));
    router.get('/v1/price', asyncHandler(handlers.getPriceAsync.bind(handlers, SwapVersion.V1)));
    router.get('/v1/quote', asyncHandler(handlers.getQuoteAsync.bind(handlers, SwapVersion.V1)));
    router.post(
        '/v1/submit',
        asyncHandler(handlers.submitTransactionIfWhitelistedAsync.bind(handlers, SwapVersion.V1)),
    );

    return router;
};

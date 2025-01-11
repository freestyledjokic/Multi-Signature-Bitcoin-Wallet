;; Multi-Signature Bitcoin Wallet Smart Contract

;; Constants
(define-constant THRESHOLD u2) ;; Both sender and receiver must approve

;; Error codes
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_ALREADY_EXISTS (err u101))
(define-constant ERR_NOT_FOUND (err u102))
(define-constant ERR_ALREADY_APPROVED (err u103))
(define-constant ERR_INVALID_AMOUNT (err u104))
(define-constant ERR_INVALID_ID (err u105))
(define-constant ERR_INSUFFICIENT_APPROVALS (err u106))
(define-constant ERR_NOT_SENDER_OR_RECEIVER (err u107))

;; Storage: Keeps track of transaction proposals
(define-map proposals
  { id: uint }
  {
    to: (string-ascii 34),
    amount: uint,
    sender: principal,
    sender-approved: bool,
    receiver-approved: bool,
    approvals: uint
  })

;; Utility: Check if principal is the sender or receiver for a proposal
(define-read-only (can-approve (id uint) (approver principal))
  (let ((proposal (map-get? proposals { id: id })))
    (if (is-some proposal)
      (let ((data (unwrap! proposal false)))
        (or
          (is-eq approver (get sender data))
          (is-eq approver tx-sender)
        )
      )
      false
    )
  ))

;; Proposal: Anyone can create a new Bitcoin transaction proposal
(define-public (propose-transaction (id uint) (to (string-ascii 34)) (amount uint))
  (begin
    (asserts! (is-none (map-get? proposals { id: id })) ERR_ALREADY_EXISTS)
    (asserts! (> id u0) ERR_INVALID_ID)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    
    ;; Store the proposal with sender information
    (map-set proposals 
      { id: id }
      {
        to: to,
        amount: amount,
        sender: tx-sender,
        sender-approved: false,
        receiver-approved: false,
        approvals: u0
      })
    (ok id)
  ))

;; Approve: Only sender and receiver can approve
(define-public (approve-transaction (id uint))
  (let ((proposal (map-get? proposals { id: id })))
    (begin
      (asserts! (is-some proposal) ERR_NOT_FOUND)
      (asserts! (can-approve id tx-sender) ERR_NOT_SENDER_OR_RECEIVER)

      (let ((data (unwrap! proposal ERR_NOT_FOUND)))
        ;; Check if already approved by this user
        (asserts! (if (is-eq tx-sender (get sender data))
                     (not (get sender-approved data))
                     (not (get receiver-approved data)))
                 ERR_ALREADY_APPROVED)
        
        ;; Update approval status based on who is approving
        (map-set proposals { id: id }
          {
            to: (get to data),
            amount: (get amount data),
            sender: (get sender data),
            sender-approved: (if (is-eq tx-sender (get sender data))
                               true
                               (get sender-approved data)),
            receiver-approved: (if (not (is-eq tx-sender (get sender data)))
                                 true
                                 (get receiver-approved data)),
            approvals: (+ (get approvals data) u1)
          })
        (ok id)
      )
    )
  ))

;; Execute: Send BTC if both parties have approved
(define-public (execute-transaction (id uint))
  (let ((proposal (map-get? proposals { id: id })))
    (begin
      (asserts! (is-some proposal) ERR_NOT_FOUND)
      
      (let ((data (unwrap! proposal ERR_NOT_FOUND)))
        (asserts! (and (get sender-approved data) 
                      (get receiver-approved data)) 
                 ERR_INSUFFICIENT_APPROVALS)

        ;; Print the transaction details
        (print {
          action: "send-btc",
          sender: (get sender data),
          recipient: (get to data),
          amount: (get amount data)
        })

        ;; Remove transaction after execution
        (map-delete proposals { id: id })
        (ok id)
      )
    )
  ))

;; Read-only function: Get transaction details
(define-read-only (get-transaction (id uint))
  (map-get? proposals { id: id }))

;; Read-only function: Get approval status for a transaction
(define-read-only (get-approval-status (id uint))
  (let ((proposal (map-get? proposals { id: id })))
    (if (is-some proposal)
      (let ((data (unwrap! proposal { sender-approved: false, receiver-approved: false })))
        {
          sender-approved: (get sender-approved data),
          receiver-approved: (get receiver-approved data)
        })
      { sender-approved: false, receiver-approved: false })))